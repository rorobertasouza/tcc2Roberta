<?php
session_start();
require_once __DIR__ . '/cors.php';
include "config.php";

// Aceitar user_id do body, query ou sessão
$input = json_decode(file_get_contents("php://input"), true);
$user_id = $input["user_id"] ?? ($_POST["user_id"] ?? ($_GET["user_id"] ?? ($_SESSION["user_id"] ?? null)));

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado"]);
    exit;
}

$user_id = intval($user_id);

// Deletar todos os matches (likes/dislikes) do usuário
$stmt = $conn->prepare("DELETE FROM matches WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();

$deleted = $stmt->affected_rows;

echo json_encode([
    "success" => true,
    "message" => "Todas as escolhas foram resetadas!",
    "deleted" => $deleted
]);
