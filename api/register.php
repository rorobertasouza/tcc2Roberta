<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST");

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "adocao";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Erro na conexão"]);
    exit;
}

$email = $_POST["email"] ?? "";
$senha = $_POST["senha"] ?? "";

if (empty($email) || empty($senha)) {
    echo json_encode(["success" => false, "message" => "Email e senha são obrigatórios"]);
    exit;
}

// Cria hash seguro da senha
$senhaHash = password_hash($senha, PASSWORD_DEFAULT);

$sql = "INSERT INTO users (email, senha) VALUES (?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $email, $senhaHash);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Usuário cadastrado com sucesso"]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar usuário"]);
}
