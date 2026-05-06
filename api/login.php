<?php
header("Access-Control-Allow-Origin: *");
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

    // 🔒 Verifica a senha criptografada
    if (password_verify($password, $user['senha'])) {
        echo json_encode([
            "success" => true,
            "user" => $user
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Senha incorreta"
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Usuário não encontrado"
    ]);
}
?>
