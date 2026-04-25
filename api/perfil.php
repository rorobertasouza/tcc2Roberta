<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST");

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "adocao";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Erro na conexão"]);
    exit;
}

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado"]);
    exit;
}

$user_id = $_SESSION["user_id"];

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $sql = "SELECT nome, email, residencia, espaco, tempo, experiencia,
                   preferencia_especie, preferencia_porte, preferencia_idade,
                   preferencia_sexo, aceita_especial
            FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        echo json_encode(["success" => true, "data" => $row]);
    } else {
        echo json_encode(["success" => false, "message" => "Perfil não encontrado"]);
    }
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $sql = "UPDATE users SET nome=?, email=?, residencia=?, espaco=?, tempo=?, experiencia=?,
            preferencia_especie=?, preferencia_porte=?, preferencia_idade=?, preferencia_sexo=?, aceita_especial=?
            WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sssssssssssi",
        $_POST["nome"],
        $_POST["email"],
        $_POST["residencia"],
        $_POST["espaco"],
        $_POST["tempo"],
        $_POST["experiencia"],
        $_POST["preferencia_especie"],
        $_POST["preferencia_porte"],
        $_POST["preferencia_idade"],
        $_POST["preferencia_sexo"],
        $_POST["aceita_especial"],
        $user_id
    );

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Perfil atualizado com sucesso"]);
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao atualizar perfil"]);
    }
    exit;
}
