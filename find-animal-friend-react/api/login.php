<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "config.php";

// 🔥 pegar dados simples (SEM JSON, SEM complicação)
$email = $_POST['email'] ?? null;
$password = $_POST['password'] ?? null;

if (!$email || !$password) {
    echo json_encode([
        "success" => false,
        "error" => "Dados não enviados"
    ]);
    exit;
}

// consulta
$sql = "SELECT * FROM users WHERE email='$email'";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();

    // 🔥 comparação simples (pra funcionar AGORA)
    if ($password === $user['senha']) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false]);
    }
} else {
    echo json_encode(["success" => false]);
}