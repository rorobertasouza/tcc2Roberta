<?php
require_once __DIR__ . '/cors.php';
include "config.php";

$data = json_decode(file_get_contents("php://input"), true);
$pet_id = intval($data["pet_id"] ?? ($_POST["pet_id"] ?? 0));
$user_id = intval($data["user_id"] ?? ($_POST["user_id"] ?? 0));

if (!$pet_id) {
    echo json_encode(["success" => false, "message" => "pet_id obrigatório"]);
    exit;
}

// Marcar pet como adotado
$stmt = $conn->prepare("UPDATE pets SET adotado = 1 WHERE id = ?");
$stmt->bind_param("i", $pet_id);

if ($stmt->execute()) {
    // Registrar na tabela de adoções se tiver user_id
    if ($user_id) {
        $checkStmt = $conn->prepare("SELECT id FROM adocoes WHERE user_id = ? AND pet_id = ?");
        $checkStmt->bind_param("ii", $user_id, $pet_id);
        $checkStmt->execute();
        if ($checkStmt->get_result()->num_rows === 0) {
            $insStmt = $conn->prepare("INSERT INTO adocoes (user_id, pet_id) VALUES (?, ?)");
            $insStmt->bind_param("ii", $user_id, $pet_id);
            $insStmt->execute();
        }
    }

    echo json_encode(["success" => true, "message" => "Pet adotado com sucesso!", "pet_id" => $pet_id]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao atualizar pet: " . $conn->error]);
}
?>
