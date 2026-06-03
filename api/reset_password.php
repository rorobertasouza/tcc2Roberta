<?php
require_once __DIR__ . '/cors.php';
include "config.php";

// Accept JSON or POST
$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data["email"] ?? $_POST['email'] ?? "");
$action = trim($data["action"] ?? $_POST['action'] ?? "check"); // "check" or "reset"
$new_password = trim($data["password"] ?? $_POST['password'] ?? "");

if (!$email) {
    echo json_encode(["success" => false, "message" => "Email é obrigatório."]);
    exit;
}

// 1. Check if email exists in users or ongs
$user_type = ""; // "user" or "ong"
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    $user_type = "user";
}
$stmt->close();

if (!$user_type) {
    $stmt = $conn->prepare("SELECT id FROM ongs WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        $user_type = "ong";
    }
    $stmt->close();
}

if (!$user_type) {
    echo json_encode(["success" => false, "message" => "Email não encontrado em nosso sistema."]);
    exit;
}

if ($action === "check") {
    // Email exists, return success to show the reset password fields
    echo json_encode([
        "success" => true,
        "message" => "Email encontrado.",
        "user_type" => $user_type
    ]);
    exit;
}

if ($action === "reset") {
    if (!$new_password) {
        echo json_encode(["success" => false, "message" => "Nova senha é obrigatória."]);
        exit;
    }
    
    if (strlen($new_password) < 6) {
        echo json_encode(["success" => false, "message" => "A senha deve ter pelo menos 6 caracteres."]);
        exit;
    }
    
    $senhaHash = password_hash($new_password, PASSWORD_DEFAULT);
    
    if ($user_type === "user") {
        $stmt = $conn->prepare("UPDATE users SET senha = ? WHERE email = ?");
    } else {
        $stmt = $conn->prepare("UPDATE ongs SET senha = ? WHERE email = ?");
    }
    
    $stmt->bind_param("ss", $senhaHash, $email);
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Senha redefinida com sucesso!"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Erro ao redefinir a senha: " . $conn->error
        ]);
    }
    $stmt->close();
    exit;
}
?>
