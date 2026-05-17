<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$nome   = trim($data["nome"]   ?? "");
$email  = trim($data["email"]  ?? "");
$senha  = trim($data["senha"]  ?? "");
$contato = trim($data["contato"] ?? "");

if (!$nome || !$email || !$senha) {
    echo json_encode(["success" => false, "message" => "Preencha todos os campos obrigatórios."]);
    exit;
}

// Verificar se email já existe
$check = $conn->prepare("SELECT id FROM ongs WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Este email já está cadastrado."]);
    exit;
}
$check->close();

$senhaHash = password_hash($senha, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO ongs (nome, email, senha, contato) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $nome, $email, $senhaHash, $contato);

if ($stmt->execute()) {
    $ong_id = $stmt->insert_id;
    echo json_encode([
        "success" => true,
        "message" => "ONG cadastrada com sucesso!",
        "ong" => ["id" => $ong_id, "nome" => $nome, "email" => $email]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar ONG: " . $conn->error]);
}
