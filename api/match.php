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

// Receber dados
$input = json_decode(file_get_contents("php://input"), true);
$pet_id = $input["pet_id"] ?? ($_POST["pet_id"] ?? null);
$action = $input["action"] ?? ($_POST["action"] ?? null);

// Aceitar user_id da sessão OU do body (fallback para CORS)
$user_id = $_SESSION["user_id"] ?? ($input["user_id"] ?? ($_POST["user_id"] ?? null));

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado"]);
    exit;
}

$user_id = intval($user_id);

if (!$pet_id || !$action || !in_array($action, ['like', 'dislike'])) {
    echo json_encode(["success" => false, "message" => "Dados inválidos. Envie pet_id e action (like/dislike)"]);
    exit;
}

// Verificar se já existe um match para este par user/pet
$checkStmt = $conn->prepare("SELECT id FROM matches WHERE user_id = ? AND pet_id = ?");
$checkStmt->bind_param("ii", $user_id, $pet_id);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    // Atualizar ação existente
    $updateStmt = $conn->prepare("UPDATE matches SET action = ?, created_at = CURRENT_TIMESTAMP WHERE user_id = ? AND pet_id = ?");
    $updateStmt->bind_param("sii", $action, $user_id, $pet_id);
    $updateStmt->execute();
} else {
    // Inserir novo match
    $insertStmt = $conn->prepare("INSERT INTO matches (user_id, pet_id, action) VALUES (?, ?, ?)");
    $insertStmt->bind_param("iis", $user_id, $pet_id, $action);
    $insertStmt->execute();
}

$response = ["success" => true, "action" => $action];

// Se for like, retornar dados do pet e contato da ONG para WhatsApp
if ($action === 'like') {
    $petStmt = $conn->prepare("
        SELECT p.id, p.name, p.description, p.image, p.age, p.breed, 
               p.location, p.size, p.gender, p.contact, p.vaccinated, p.neutered,
               p.ong_id
        FROM pets p 
        WHERE p.id = ?
    ");
    $petStmt->bind_param("i", $pet_id);
    $petStmt->execute();
    $petResult = $petStmt->get_result();
    
    if ($pet = $petResult->fetch_assoc()) {
        $response["pet"] = [
            "id" => $pet["id"],
            "nome" => $pet["name"],
            "descricao" => $pet["description"],
            "foto" => resolveImage($pet["image"], $baseUrl),
            "idade" => $pet["age"],
            "especie" => $pet["breed"],
            "local" => $pet["location"],
            "porte" => $pet["size"],
            "sexo" => $pet["gender"],
            "contato" => $pet["contact"],
            "vacinado" => $pet["vaccinated"],
            "castrado" => $pet["neutered"]
        ];
        
        // Montar link do WhatsApp
        $contato = preg_replace('/[^0-9]/', '', $pet["contact"]);
        $nomeUser = "";
        $userStmt = $conn->prepare("SELECT nome FROM users WHERE id = ?");
        $userStmt->bind_param("i", $user_id);
        $userStmt->execute();
        $userResult = $userStmt->get_result();
        if ($u = $userResult->fetch_assoc()) {
            $nomeUser = $u["nome"];
        }
        
        $mensagem = urlencode("Olá! Sou $nomeUser e me interessei pelo pet {$pet['name']} que vi no Find Animal Friend. Gostaria de saber mais sobre a adoção! 🐾");
        $response["whatsapp_url"] = "https://wa.me/55{$contato}?text={$mensagem}";
    }
}

echo json_encode($response);
