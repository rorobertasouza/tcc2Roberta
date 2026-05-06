<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "config.php";

$result = $conn->query("SELECT id, name, description, image, age, breed, location, size, gender, contact, vaccinated, neutered FROM pets");

$pets = [];

while ($row = $result->fetch_assoc()) {
    $pets[] = [
        "id" => $row["id"],
        "nome" => $row["name"],
        "descricao" => $row["description"],
        "foto" => $row["image"],   // 🔥 renomeado para 'foto'
        "idade" => $row["age"],
        "especie" => $row["breed"],
        "local" => $row["location"],
        "porte" => $row["size"],
        "sexo" => $row["gender"],
        "contato" => $row["contact"],
        "vacinado" => $row["vaccinated"],
        "castrado" => $row["neutered"]
    ];
}

echo json_encode($pets);
