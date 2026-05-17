<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"] ?? "";
$senha = $data["senha"] ?? "";

$stmt = $conn->prepare("SELECT * FROM ongs WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $ong = $result->fetch_assoc();
    if (password_verify($senha, $ong["senha"])) {
        echo json_encode(["success" => true, "ong" => [
            "id" => $ong["id"],
            "nome" => $ong["nome"],
            "email" => $ong["email"],
            "contato" => $ong["contato"]
        ]]);
    } else {
        echo json_encode(["success" => false, "message" => "Senha incorreta"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "ONG não encontrada"]);
}
