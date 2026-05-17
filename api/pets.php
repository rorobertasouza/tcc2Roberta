<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include "config.php";

$baseUrl = "http://localhost/find-animal-friend-react/api/";
function resolveImage($img, $baseUrl) {
    if (empty($img)) return "";
    if (strpos($img, 'http://') === 0 || strpos($img, 'https://') === 0) return $img;
    return $baseUrl . ltrim($img, '/');
}

// Verificar se há um usuário logado para filtragem
$user_id = $_SESSION["user_id"] ?? ($_GET["user_id"] ?? null);

if ($user_id) {
    // Buscar preferências do usuário
    $userStmt = $conn->prepare("SELECT preferencia_especie, preferencia_porte, preferencia_idade, preferencia_sexo, aceita_especial FROM users WHERE id = ?");
    $userStmt->bind_param("i", $user_id);
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    $userPrefs = $userResult->fetch_assoc();

    // Montar query que exclui APENAS pets já vistos (like ou dislike)
    // NÃO filtramos por preferências aqui — usamos scoring para ordenar
    $sql = "SELECT p.id, p.name, p.description, p.image, p.age, p.breed, 
                   p.location, p.size, p.gender, p.contact, p.vaccinated, p.neutered
            FROM pets p 
            WHERE p.id NOT IN (SELECT pet_id FROM matches WHERE user_id = ?)
            ORDER BY p.id DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    // Calcular score de compatibilidade para cada pet
    $pets = [];
    while ($row = $result->fetch_assoc()) {
        $score = 0;
        $totalWeight = 0;

        // ── Espécie/raça: 30% ──────────────────────────────────────────
        // breed no banco pode ser null ou o nome da raça.
        // preferencia_especie pode ser "Cachorro","Gato" (genérico) ou raça específica.
        if (!empty($userPrefs["preferencia_especie"])) {
            $totalWeight += 30;
            $prefEsp  = strtolower(trim($userPrefs["preferencia_especie"]));
            $breedVal = strtolower(trim($row["breed"] ?? ""));

            $isGenericDog = in_array($prefEsp, ["cachorro", "vira-lata"]);
            $isGenericCat = in_array($prefEsp, ["gato", "gato vira-lata", "siamês", "persa"]);

            if ($breedVal !== "") {
                if (stripos($breedVal, $prefEsp) !== false) {
                    $score += 30; // match exato
                } elseif ($isGenericDog && stripos($breedVal, "gato") === false) {
                    $score += 20; // preferência cachorro + breed não é gato
                } elseif ($isGenericCat && stripos($breedVal, "gato") !== false) {
                    $score += 20; // preferência gato + breed é gato
                }
            } else {
                // breed nula: assume cachorro (maioria dos abrigos)
                if ($isGenericDog) $score += 15;
                elseif (!$isGenericCat) $score += 10; // raça específica, incerto
            }
        }

        // ── Porte: 25% ─────────────────────────────────────────────────
        // preferencia_porte pode ser "P","M","G" ou "Pequeno","Médio","Grande"
        if (!empty($userPrefs["preferencia_porte"])) {
            $totalWeight += 25;
            $prefPorte = strtolower(trim($userPrefs["preferencia_porte"]));
            $sizeVal   = strtolower(trim($row["size"] ?? ""));

            // mapa letra → variantes aceitas
            $porteVariants = [
                "p" => ["p", "pequeno"],
                "m" => ["m", "médio", "medio"],
                "g" => ["g", "grande"],
                "pequeno" => ["p", "pequeno"],
                "médio"   => ["m", "médio", "medio"],
                "medio"   => ["m", "médio", "medio"],
                "grande"  => ["g", "grande"],
            ];
            $variants = $porteVariants[$prefPorte] ?? [$prefPorte];
            if (!empty($sizeVal)) {
                foreach ($variants as $v) {
                    if ($sizeVal === $v || stripos($sizeVal, $v) !== false) {
                        $score += 25;
                        break;
                    }
                }
            }
        }

        // ── Faixa etária: 20% ──────────────────────────────────────────
        // age no banco é INT (anos); preferência é "Filhote","Jovem","Adulto","Idoso"
        if (!empty($userPrefs["preferencia_idade"])) {
            $totalWeight += 20;
            $prefIdade = strtolower(trim($userPrefs["preferencia_idade"]));
            $ageVal    = ($row["age"] !== null && $row["age"] !== "") ? intval($row["age"]) : -1;

            if ($ageVal >= 0) {
                if      ($ageVal <= 1) $faixa = "filhote";
                elseif  ($ageVal <= 3) $faixa = "jovem";
                elseif  ($ageVal <= 7) $faixa = "adulto";
                else                   $faixa = "idoso";

                if (stripos($prefIdade, $faixa) !== false) $score += 20;
            } else {
                $score += 10; // age desconhecida: score parcial neutro
            }
        }

        // ── Sexo: 15% ──────────────────────────────────────────────────
        if (!empty($userPrefs["preferencia_sexo"])) {
            $totalWeight += 15;
            $prefSexo  = strtolower(trim($userPrefs["preferencia_sexo"]));
            $genderVal = strtolower(trim($row["gender"] ?? ""));

            $isMachoPref  = in_array($prefSexo, ["macho", "m"]);
            $isFemeaPref  = in_array($prefSexo, ["fêmea", "femea", "f"]);
            $isMachoPet   = in_array($genderVal, ["macho", "m"]);
            $isFemeaPet   = in_array($genderVal, ["fêmea", "femea", "f"]);

            if (($isMachoPref && $isMachoPet) || ($isFemeaPref && $isFemeaPet)) {
                $score += 15;
            }
        }

        // ── Calcular porcentagem ────────────────────────────────────────
        // Se nenhuma preferência definida → 100%
        // Se há preferências: mapeia [0..totalWeight] → [50..100]
        // Garantindo mínimo de 50% para todos os pets visíveis
        $compatibility = $totalWeight > 0
            ? max(50, min(100, 50 + round(($score / $totalWeight) * 50)))
            : 100;

        $pets[] = [
            "id"              => $row["id"],
            "nome"            => $row["name"],
            "descricao"       => $row["description"],
            "foto"            => resolveImage($row["image"], $baseUrl),
            "idade"           => $row["age"],
            "especie"         => $row["breed"],
            "local"           => $row["location"],
            "porte"           => $row["size"],
            "sexo"            => $row["gender"],
            "contato"         => $row["contact"],
            "vacinado"        => $row["vaccinated"],
            "castrado"        => $row["neutered"],
            "compatibilidade" => $compatibility
        ];
    }

    // Ordenar por compatibilidade (maior primeiro)
    usort($pets, function($a, $b) {
        return $b["compatibilidade"] - $a["compatibilidade"];
    });

    echo json_encode($pets);
} else {
    // Sem usuário logado: retorna todos os pets sem filtragem
    $result = $conn->query("SELECT id, name, description, image, age, breed, location, size, gender, contact, vaccinated, neutered FROM pets");

    $pets = [];
    while ($row = $result->fetch_assoc()) {
        $pets[] = [
            "id" => $row["id"],
            "nome" => $row["name"],
            "descricao" => $row["description"],
            "foto" => resolveImage($row["image"], $baseUrl),
            "idade" => $row["age"],
            "especie" => $row["breed"],
            "local" => $row["location"],
            "porte" => $row["size"],
            "sexo" => $row["gender"],
            "contato" => $row["contact"],
            "vacinado" => $row["vaccinated"],
            "castrado" => $row["neutered"],
            "compatibilidade" => 100
        ];
    }

    echo json_encode($pets);
}
