<?php
session_start();
require_once __DIR__ . '/cors.php';

include "config.php";

$baseUrl = "http://localhost/find-animal-friend-react/api/";
function resolveImage($img, $baseUrl) {
    if (empty($img)) return "";
    if (strpos($img, 'http://') === 0 || strpos($img, 'https://') === 0) return $img;
    return $baseUrl . ltrim($img, '/');
}

// Aceitar user_id da sessão OU do parâmetro (fallback para CORS)
$user_id = $_SESSION["user_id"] ?? ($_GET["user_id"] ?? null);

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado"]);
    exit;
}

$user_id = intval($user_id);

// Buscar nome do usuário
$nomeUser = "";
$userStmt = $conn->prepare("SELECT nome FROM users WHERE id = ?");
$userStmt->bind_param("i", $user_id);
$userStmt->execute();
$userResult = $userStmt->get_result();
if ($u = $userResult->fetch_assoc()) {
    $nomeUser = $u["nome"];
}

// Buscar todos os pets que o usuário deu like
$stmt = $conn->prepare("
    SELECT p.id, p.name, p.description, p.image, p.age, p.breed,
           p.location, p.size, p.gender, p.contact, p.vaccinated, p.neutered,
           m.created_at as matched_at
    FROM matches m
    INNER JOIN pets p ON m.pet_id = p.id
    WHERE m.user_id = ? AND m.action = 'like'
    ORDER BY m.created_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$matches = [];
while ($row = $result->fetch_assoc()) {
    $contato = preg_replace('/[^0-9]/', '', $row["contact"]);
    $mensagem = urlencode("Olá! Sou $nomeUser e me interessei pelo pet {$row['name']} que vi no Find Animal Friend. Gostaria de saber mais sobre a adoção! 🐾");
    
    $matches[] = [
        "id" => $row["id"],
        "nome" => $row["name"],
        "descricao" => $row["description"],
        "foto" => resolveImage($row["image"], $baseUrl),
        "idade" => $row["age"],
        "especie" => $row["breed"],
        "local" => $row["location"],
        "porte" => $row["size"],
        "sexo" => $row["gender"],
        "contato" => $row["contact"],
        "vacinado" => $row["vaccinated"],
        "castrado" => $row["neutered"],
        "matched_at" => $row["matched_at"],
        "whatsapp_url" => "https://wa.me/55{$contato}?text={$mensagem}"
    ];
}

echo json_encode(["success" => true, "matches" => $matches, "total" => count($matches)]);
