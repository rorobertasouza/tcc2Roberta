<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "adocao";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Erro na conexão");
}
?>