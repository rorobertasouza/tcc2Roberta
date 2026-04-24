<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

include "config.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$email = $_POST["email"] ?? "";
$senha = $_POST["password"] ?? "";

$response = [];

if (empty($email) || empty($senha)) {
    $response = ["success" => false, "message" => "Email e senha são obrigatórios."];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    if (password_verify($senha, $user["senha"])) {
        $response = ["success" => true, "message" => "Login realizado com sucesso!"];
    } else {
        $response = ["success" => false, "message" => "Senha incorreta."];
    }
} else {
    $response = ["success" => false, "message" => "Usuário não encontrado."];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);

$stmt->close();
$conn->close();
?>
