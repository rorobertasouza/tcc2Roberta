<?php
require_once __DIR__ . '/cors.php';

include "config.php";

$nome = $_POST["nome"] ?? "";
$descricao = $_POST["descricao"] ?? "";
$foto = $_POST["foto"] ?? "";
$idade = $_POST["idade"] ?? "";
$especie = $_POST["especie"] ?? "";
$local = $_POST["local"] ?? "";
$porte = $_POST["porte"] ?? "";
$sexo = $_POST["sexo"] ?? "";
$vacinado = $_POST["vacinado"] ?? "";
$castrado = $_POST["castrado"] ?? "";
$contato = $_POST["contato"] ?? "";
$ong_id = $_POST["ong_id"] ?? 0;

$stmt = $conn->prepare("INSERT INTO pets (name, description, image, age, breed, location, size, gender, vaccinated, neutered, contact, ong_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssssssssi", $nome, $descricao, $foto, $idade, $especie, $local, $porte, $sexo, $vacinado, $castrado, $contato, $ong_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Pet cadastrado com sucesso"]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao cadastrar pet"]);
}
