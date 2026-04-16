<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "config.php";

$data = json_decode(file_get_contents("php://input"));

$email = $data->email;
$password = password_hash($data->password, PASSWORD_DEFAULT);

$sql = "INSERT INTO users (email, password) VALUES ('$email', '$password')";

if ($conn->query($sql)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false]);
}
?>