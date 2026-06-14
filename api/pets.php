<?php
session_start();
require_once __DIR__ . '/cors.php';

include "config.php";

$baseUrl = "http://localhost/find-animal-friend-react/api/";
function resolveImage($img, $baseUrl) {
    if (empty($img)) return "";
    if (strpos($img, 'http://') === 0 || strpos($img, 'https://') === 0) return $img;
    return $baseUrl . ltrim($img, '/');
}

// Função Haversine para calcular distância entre dois pontos geográficos (em km)
function haversineDistance($lat1, $lng1, $lat2, $lng2) {
    if ($lat1 === null || $lng1 === null || $lat2 === null || $lng2 === null) return null;
    $earthRadius = 6371; // km
    $dLat = deg2rad($lat2 - $lat1);
    $dLng = deg2rad($lng2 - $lng1);
    $a = sin($dLat / 2) * sin($dLat / 2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLng / 2) * sin($dLng / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    return round($earthRadius * $c, 1);
}

// Verificar se há um usuário logado para filtragem
$input = json_decode(file_get_contents("php://input"), true);
if (!$input) $input = [];
$user_id = $input["user_id"] ?? ($_GET["user_id"] ?? ($_POST["user_id"] ?? ($_SESSION["user_id"] ?? null)));

// Coordenadas do usuário (para cálculo de distância)
$user_lat = $_GET["user_lat"] ?? null;
$user_lng = $_GET["user_lng"] ?? null;

// Se não veio via query param, buscar do banco
if ($user_id && ($user_lat === null || $user_lng === null)) {
    $locStmt = $conn->prepare("SELECT latitude, longitude FROM users WHERE id = ?");
    $locStmt->bind_param("i", $user_id);
    $locStmt->execute();
    $locResult = $locStmt->get_result();
    if ($locRow = $locResult->fetch_assoc()) {
        if ($user_lat === null) $user_lat = $locRow["latitude"];
        if ($user_lng === null) $user_lng = $locRow["longitude"];
    }
}

// Buscar IDs dos favoritos do usuário
$favoritosIds = [];
if ($user_id) {
    $favStmt = $conn->prepare("SELECT pet_id FROM favoritos WHERE user_id = ?");
    $favStmt->bind_param("i", $user_id);
    $favStmt->execute();
    $favResult = $favStmt->get_result();
    while ($favRow = $favResult->fetch_assoc()) {
        $favoritosIds[] = intval($favRow["pet_id"]);
    }
}

// Buscar contagem de interessados (matches) por pet
$interessadosMap = [];
$intResult = $conn->query("SELECT pet_id, COUNT(*) as total FROM matches WHERE action = 'like' GROUP BY pet_id");
if ($intResult) {
    while ($intRow = $intResult->fetch_assoc()) {
        $interessadosMap[intval($intRow["pet_id"])] = intval($intRow["total"]);
    }
}

// Buscar fila de adoção ativa por pet
$filaMap = [];
$filaResult = $conn->query("SELECT pet_id, COUNT(*) as na_fila FROM fila_adocao WHERE status = 'na_fila' GROUP BY pet_id");
if ($filaResult) {
    while ($filaRow = $filaResult->fetch_assoc()) {
        $filaMap[intval($filaRow["pet_id"])] = intval($filaRow["na_fila"]);
    }
}

if ($user_id) {
    // Buscar preferências do usuário
    $userStmt = $conn->prepare("SELECT preferencia_especie, preferencia_porte, preferencia_idade, preferencia_sexo, aceita_especial FROM users WHERE id = ?");
    $userStmt->bind_param("i", $user_id);
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    $userPrefs = $userResult->fetch_assoc();

    // Buscar pets não vistos (inclui adotados para mostrar flag em tempo real)
    $sql = "SELECT p.id, p.name, p.description, p.image, p.age, p.breed, 
                   p.location, p.size, p.gender, p.contact, p.vaccinated, p.neutered,
                   p.adotado, p.latitude, p.longitude, p.origem, p.motivo_adocao, p.data_cadastro
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
        if (!empty($userPrefs["preferencia_especie"])) {
            $totalWeight += 30;
            $prefEsp  = strtolower(trim($userPrefs["preferencia_especie"]));
            $breedVal = strtolower(trim($row["breed"] ?? ""));

            $isGenericDog = in_array($prefEsp, ["cachorro", "vira-lata"]);
            $isGenericCat = in_array($prefEsp, ["gato", "gato vira-lata", "siamês", "persa"]);

            if ($breedVal !== "") {
                if (stripos($breedVal, $prefEsp) !== false) {
                    $score += 30;
                } elseif ($isGenericDog && stripos($breedVal, "gato") === false) {
                    $score += 20;
                } elseif ($isGenericCat && stripos($breedVal, "gato") !== false) {
                    $score += 20;
                }
            } else {
                if ($isGenericDog) $score += 15;
                elseif (!$isGenericCat) $score += 10;
            }
        }

        // ── Porte: 25% ─────────────────────────────────────────────────
        if (!empty($userPrefs["preferencia_porte"])) {
            $totalWeight += 25;
            $prefPorte = strtolower(trim($userPrefs["preferencia_porte"]));
            $sizeVal   = strtolower(trim($row["size"] ?? ""));

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
                $score += 10;
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
        $compatibility = $totalWeight > 0
            ? max(50, min(100, 50 + round(($score / $totalWeight) * 50)))
            : 100;

        // ── Calcular distância ──────────────────────────────────────────
        $distancia = haversineDistance($user_lat, $user_lng, $row["latitude"], $row["longitude"]);

        // ── Tempo aguardando adoção ─────────────────────────────────────
        $tempoAguardando = null;
        if (!empty($row["data_cadastro"])) {
            $cadastro = new DateTime($row["data_cadastro"]);
            $agora = new DateTime();
            $diff = $cadastro->diff($agora);
            if ($diff->y > 0) {
                $tempoAguardando = $diff->y . " ano" . ($diff->y > 1 ? "s" : "");
            } elseif ($diff->m > 0) {
                $tempoAguardando = $diff->m . " " . ($diff->m > 1 ? "meses" : "mês");
            } elseif ($diff->d > 0) {
                $tempoAguardando = $diff->d . " dia" . ($diff->d > 1 ? "s" : "");
            } else {
                $tempoAguardando = "Hoje";
            }
        }

        $petId = intval($row["id"]);

        $pets[] = [
            "id"              => $petId,
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
            "adotado"         => intval($row["adotado"]),
            "compatibilidade" => $compatibility,
            "latitude"        => $row["latitude"] !== null ? floatval($row["latitude"]) : null,
            "longitude"       => $row["longitude"] !== null ? floatval($row["longitude"]) : null,
            "distancia_km"    => $distancia !== null ? floatval($distancia) : null,
            "favorito"        => in_array($petId, $favoritosIds) ? 1 : 0,
            "origem"          => $row["origem"] ?? null,
            "motivo_adocao"   => $row["motivo_adocao"] ?? null,
            "tempo_aguardando" => $tempoAguardando,
            "interessados"    => $interessadosMap[$petId] ?? 0,
            "na_fila"         => $filaMap[$petId] ?? 0,
        ];
    }

    // Ordenar por compatibilidade (maior primeiro)
    usort($pets, function($a, $b) {
        return $b["compatibilidade"] - $a["compatibilidade"];
    });

    echo json_encode($pets);
} else {
    // Sem usuário logado: retorna todos os pets
    $result = $conn->query("SELECT id, name, description, image, age, breed, location, size, gender, contact, vaccinated, neutered, adotado, latitude, longitude, origem, motivo_adocao, data_cadastro FROM pets");

    $pets = [];
    while ($row = $result->fetch_assoc()) {
        $petId = intval($row["id"]);

        $tempoAguardando = null;
        if (!empty($row["data_cadastro"])) {
            $cadastro = new DateTime($row["data_cadastro"]);
            $agora = new DateTime();
            $diff = $cadastro->diff($agora);
            if ($diff->y > 0) {
                $tempoAguardando = $diff->y . " ano" . ($diff->y > 1 ? "s" : "");
            } elseif ($diff->m > 0) {
                $tempoAguardando = $diff->m . " " . ($diff->m > 1 ? "meses" : "mês");
            } elseif ($diff->d > 0) {
                $tempoAguardando = $diff->d . " dia" . ($diff->d > 1 ? "s" : "");
            } else {
                $tempoAguardando = "Hoje";
            }
        }

        $pets[] = [
            "id"              => $petId,
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
            "adotado"         => intval($row["adotado"]),
            "compatibilidade" => 100,
            "latitude"        => $row["latitude"] !== null ? floatval($row["latitude"]) : null,
            "longitude"       => $row["longitude"] !== null ? floatval($row["longitude"]) : null,
            "distancia_km"    => null,
            "favorito"        => 0,
            "origem"          => $row["origem"] ?? null,
            "motivo_adocao"   => $row["motivo_adocao"] ?? null,
            "tempo_aguardando" => $tempoAguardando,
            "interessados"    => $interessadosMap[$petId] ?? 0,
            "na_fila"         => $filaMap[$petId] ?? 0,
        ];
    }

    echo json_encode($pets);
}
