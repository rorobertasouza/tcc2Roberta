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
    echo json_encode(["success" => false, "message" => "Email ou senha não enviados"]);
    exit;
}

$sql = "SELECT id, nome, email, senha FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // Verifica se a senha é hash ou texto simples
    if (password_verify($senha, $row["senha"]) || $row["senha"] === $senha) {
        $_SESSION["user_id"] = $row["id"];
        echo json_encode(["success" => true, "message" => "Login realizado com sucesso"]);
    } else {
        echo json_encode(["success" => false, "message" => "Senha incorreta"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Usuário não encontrado"]);
}
