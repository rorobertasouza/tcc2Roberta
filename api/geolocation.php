<?php
session_start();
require_once __DIR__ . '/cors.php';
include "config.php";

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) $input = [];
$user_id = $input["user_id"] ?? ($_GET["user_id"] ?? ($_POST["user_id"] ?? ($_SESSION["user_id"] ?? null)));

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado"]);
    exit;
}

$user_id = intval($user_id);

// ── POST: Salvar localização do usuário ──
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input) $input = $_POST;

    $latitude  = floatval($input["latitude"] ?? 0);
    $longitude = floatval($input["longitude"] ?? 0);

    if ($latitude == 0 && $longitude == 0) {
        echo json_encode(["success" => false, "message" => "Coordenadas inválidas"]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE users SET latitude = ?, longitude = ? WHERE id = ?");
    $stmt->bind_param("ddi", $latitude, $longitude, $user_id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Localização salva"]);
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao salvar localização"]);
    }
    exit;
}

// ── GET: Buscar localização do usuário ──
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $stmt = $conn->prepare("SELECT latitude, longitude FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            "success"   => true,
            "latitude"  => $row["latitude"],
            "longitude" => $row["longitude"],
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Usuário não encontrado"]);
    }
    exit;
}

echo json_encode(["success" => false, "message" => "Método não permitido"]);
?>
