<?php
require_once __DIR__ . '/cors.php';

$conn = new mysqli("localhost", "root", "", "adocao");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Erro banco"]);
    exit;
}

$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

$residencia = $_POST['residencia'] ?? '';
$espaco = $_POST['espaco'] ?? '';
$tempo = $_POST['tempo'] ?? '';
$experiencia = $_POST['experiencia'] ?? '';
$preferencia_especie = $_POST['preferencia_especie'] ?? '';
$preferencia_porte = $_POST['preferencia_porte'] ?? '';
$preferencia_idade = $_POST['preferencia_idade'] ?? '';
$preferencia_sexo = $_POST['preferencia_sexo'] ?? '';
$aceita_especial = $_POST['aceita_especial'] ?? '';

if (!$email || !$password) {
    echo json_encode([
        "success" => false,
        "message" => "Email e senha são obrigatórios"
    ]);
    exit;
}

// 🔒 Criptografa a senha
$senhaHash = password_hash($password, PASSWORD_DEFAULT);

$sql = "INSERT INTO users 
(nome, email, senha, residencia, espaco, tempo, experiencia, preferencia_especie, preferencia_porte, preferencia_idade, preferencia_sexo, aceita_especial) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "ssssssssssss",
    $name,
    $email,
    $senhaHash,
    $residencia,
    $espaco,
    $tempo,
    $experiencia,
    $preferencia_especie,
    $preferencia_porte,
    $preferencia_idade,
    $preferencia_sexo,
    $aceita_especial
);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Erro ao cadastrar",
        "erro_sql" => $conn->error
    ]);
}
?>
