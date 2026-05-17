<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include "config.php";

$baseUrl = "http://localhost/find-animal-friend-react/api/";

function resolveImage($img, $baseUrl) {
    if (empty($img)) return "";
    if (strpos($img, 'http://') === 0 || strpos($img, 'https://') === 0) return $img;
    return $baseUrl . ltrim($img, '/');
}

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: listar pets da ONG ────────────────────────────────────────
if ($method === 'GET') {
    $ong_id = intval($_GET['ong_id'] ?? 0);
    if (!$ong_id) {
        echo json_encode(["success" => false, "message" => "ong_id obrigatório"]);
        exit;
    }

    $stmt = $conn->prepare(
        "SELECT id, name, description, image, age, breed, location, size, gender,
                vaccinated, neutered, contact
         FROM pets WHERE ong_id = ? ORDER BY id DESC"
    );
    $stmt->bind_param("i", $ong_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $pets = [];
    while ($row = $result->fetch_assoc()) {
        $pets[] = [
            "id"        => $row["id"],
            "nome"      => $row["name"],
            "descricao" => $row["description"],
            "foto"      => resolveImage($row["image"], $baseUrl),
            "idade"     => $row["age"],
            "especie"   => $row["breed"],
            "local"     => $row["location"],
            "porte"     => $row["size"],
            "sexo"      => $row["gender"],
            "vacinado"  => $row["vaccinated"],
            "castrado"  => $row["neutered"],
            "contato"   => $row["contact"],
        ];
    }

    echo json_encode(["success" => true, "pets" => $pets]);
    exit;
}

// ── POST: atualizar pet ────────────────────────────────────────────
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    // Aceita tanto JSON quanto FormData
    if (!$data) $data = $_POST;

    $id      = intval($data["id"] ?? 0);
    $ong_id  = intval($data["ong_id"] ?? 0);

    if (!$id || !$ong_id) {
        echo json_encode(["success" => false, "message" => "id e ong_id obrigatórios"]);
        exit;
    }

    $nome     = $data["nome"]      ?? "";
    $descricao = $data["descricao"] ?? "";
    $foto     = $data["foto"]      ?? "";
    $idade    = $data["idade"]     ?? "";
    $especie  = $data["especie"]   ?? "";
    $local    = $data["local"]     ?? "";
    $porte    = $data["porte"]     ?? "";
    $sexo     = $data["sexo"]      ?? "";
    $vacinado = $data["vacinado"]  ?? "";
    $castrado = $data["castrado"]  ?? "";
    $contato  = $data["contato"]   ?? "";

    $stmt = $conn->prepare(
        "UPDATE pets
         SET name=?, description=?, image=?, age=?, breed=?, location=?,
             size=?, gender=?, vaccinated=?, neutered=?, contact=?
         WHERE id=? AND ong_id=?"
    );
    $stmt->bind_param(
        "sssssssssssii",
        $nome, $descricao, $foto, $idade, $especie, $local,
        $porte, $sexo, $vacinado, $castrado, $contato,
        $id, $ong_id
    );

    if ($stmt->execute() && $stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Pet atualizado com sucesso"]);
    } else {
        echo json_encode(["success" => false, "message" => "Nenhum pet atualizado (verifique id e ong_id)"]);
    }
    exit;
}

// ── DELETE: remover pet ────────────────────────────────────────────
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id     = intval($data["id"]     ?? 0);
    $ong_id = intval($data["ong_id"] ?? 0);

    if (!$id || !$ong_id) {
        echo json_encode(["success" => false, "message" => "id e ong_id obrigatórios"]);
        exit;
    }

    // Deletar matches relacionados primeiro (FK)
    $stmtM = $conn->prepare("DELETE FROM matches WHERE pet_id = ?");
    $stmtM->bind_param("i", $id);
    $stmtM->execute();

    $stmt = $conn->prepare("DELETE FROM pets WHERE id = ? AND ong_id = ?");
    $stmt->bind_param("ii", $id, $ong_id);

    if ($stmt->execute() && $stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Pet removido com sucesso"]);
    } else {
        echo json_encode(["success" => false, "message" => "Pet não encontrado ou sem permissão"]);
    }
    exit;
}

echo json_encode(["success" => false, "message" => "Método não permitido"]);
