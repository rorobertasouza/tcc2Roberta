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

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) $input = [];
$user_id = $input["user_id"] ?? ($_GET["user_id"] ?? ($_POST["user_id"] ?? ($_SESSION["user_id"] ?? null)));

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado"]);
    exit;
}

$user_id = intval($user_id);

// ── GET: Listar favoritos ──
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $stmt = $conn->prepare("
        SELECT p.id, p.name, p.description, p.image, p.age, p.breed,
               p.location, p.size, p.gender, p.contact, p.vaccinated, p.neutered,
               p.adotado, p.latitude, p.longitude,
               f.created_at as favoritado_em
        FROM favoritos f
        INNER JOIN pets p ON f.pet_id = p.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $favoritos = [];
    while ($row = $result->fetch_assoc()) {
        $favoritos[] = [
            "id"           => intval($row["id"]),
            "nome"         => $row["name"],
            "descricao"    => $row["description"],
            "foto"         => resolveImage($row["image"], $baseUrl),
            "idade"        => $row["age"],
            "especie"      => $row["breed"],
            "local"        => $row["location"],
            "porte"        => $row["size"],
            "sexo"         => $row["gender"],
            "contato"      => $row["contact"],
            "vacinado"     => $row["vaccinated"],
            "castrado"     => $row["neutered"],
            "adotado"      => intval($row["adotado"]),
            "latitude"     => $row["latitude"] !== null ? floatval($row["latitude"]) : null,
            "longitude"    => $row["longitude"] !== null ? floatval($row["longitude"]) : null,
            "favoritado_em" => $row["favoritado_em"],
        ];
    }

    echo json_encode(["success" => true, "favoritos" => $favoritos, "total" => count($favoritos)]);
    exit;
}

// ── POST: Toggle favorito ──
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input) $input = $_POST;

    $pet_id = intval($input["pet_id"] ?? 0);

    if (!$pet_id) {
        echo json_encode(["success" => false, "message" => "pet_id obrigatório"]);
        exit;
    }

    // Verificar se já é favorito
    $checkStmt = $conn->prepare("SELECT id FROM favoritos WHERE user_id = ? AND pet_id = ?");
    $checkStmt->bind_param("ii", $user_id, $pet_id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        // Remover favorito
        $delStmt = $conn->prepare("DELETE FROM favoritos WHERE user_id = ? AND pet_id = ?");
        $delStmt->bind_param("ii", $user_id, $pet_id);
        $delStmt->execute();
        echo json_encode(["success" => true, "action" => "removed", "message" => "Removido dos favoritos"]);
    } else {
        // Adicionar favorito
        $insStmt = $conn->prepare("INSERT INTO favoritos (user_id, pet_id) VALUES (?, ?)");
        $insStmt->bind_param("ii", $user_id, $pet_id);
        $insStmt->execute();
        echo json_encode(["success" => true, "action" => "added", "message" => "Adicionado aos favoritos"]);
    }
    exit;
}

echo json_encode(["success" => false, "message" => "Método não permitido"]);
?>
