<?php
// 🔥 CORS COMPLETO (igual do login)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    exit(0);
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
include "config.php";

$result = $conn->query("SELECT * FROM pets");

$pets = [];

while ($row = $result->fetch_assoc()) {
    $pets[] = [
        "id" => $row["id"],
        "nome" => $row["name"],
        "raca" => $row["description"], // ou crie campo separado
        "foto" => $row["image"]
    ];
}


echo json_encode($pets);
