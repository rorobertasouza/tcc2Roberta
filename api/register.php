<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

include "config.php";

// Se for uma requisição OPTIONS (preflight), apenas retorna OK
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$response = [];

$nome = $_POST["name"] ?? "";
$email = $_POST["email"] ?? "";
$senha = $_POST["password"] ?? "";

if (empty($nome) || empty($email) || empty($senha)) {
    $response = ["success" => false, "message" => "Todos os campos são obrigatórios."];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

$senhaHash = password_hash($senha, PASSWORD_DEFAULT);

$sql = "INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    $response = ["success" => false, "message" => "Erro na query: " . $conn->error];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

$stmt->bind_param("sss", $nome, $email, $senhaHash);

if ($stmt->execute()) {
    $response = ["success" => true, "message" => "Usuário cadastrado com sucesso!"];
} else {
    $response = ["success" => false, "message" => "Erro ao cadastrar: " . $stmt->error];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);

$stmt->close();
$conn->close();
?>
