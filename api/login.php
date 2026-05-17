<?php
session_start(); // precisa iniciar a sessão

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = new mysqli("localhost", "root", "", "adocao");

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user['senha'])) {
        // 🔑 Criar sessão
        $_SESSION["user_id"] = $user["id"];

        echo json_encode([
            "success" => true,
            "message" => "Login realizado com sucesso",
            "user" => [
                "id" => $user["id"],
                "nome" => $user["nome"],
                "email" => $user["email"]
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Senha incorreta"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Usuário não encontrado"]);
}
