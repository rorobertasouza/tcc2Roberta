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

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) $input = [];
$user_id = $input["user_id"] ?? ($_GET["user_id"] ?? ($_POST["user_id"] ?? ($_SESSION["user_id"] ?? null)));

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "Usuário não autenticado"]);
    exit;
}

$user_id = intval($user_id);

// ── GET: Listar adoções ativas e/ou diário de uma adoção ──
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $adocao_id = intval($_GET["adocao_id"] ?? 0);

    if ($adocao_id) {
        // Retornar diário de uma adoção específica
        // Verificar se a adoção pertence ao usuário
        $checkStmt = $conn->prepare("SELECT id FROM adocoes WHERE id = ? AND user_id = ?");
        $checkStmt->bind_param("ii", $adocao_id, $user_id);
        $checkStmt->execute();
        if ($checkStmt->get_result()->num_rows === 0) {
            echo json_encode(["success" => false, "message" => "Adoção não encontrada"]);
            exit;
        }

        $stmt = $conn->prepare("
            SELECT id, titulo, descricao, tipo, data_registro
            FROM pos_adocao_diario
            WHERE adocao_id = ?
            ORDER BY data_registro DESC
        ");
        $stmt->bind_param("i", $adocao_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $entradas = [];
        while ($row = $result->fetch_assoc()) {
            $entradas[] = $row;
        }

        echo json_encode(["success" => true, "entradas" => $entradas]);
        exit;
    }

    // Listar todas as adoções ativas do usuário
    $stmt = $conn->prepare("
        SELECT a.id as adocao_id, a.data_adocao, a.status,
               p.id as pet_id, p.name, p.description, p.image, p.age, p.breed,
               p.location, p.size, p.gender, p.contact, p.vaccinated, p.neutered
        FROM adocoes a
        INNER JOIN pets p ON a.pet_id = p.id
        WHERE a.user_id = ? AND a.status = 'ativa'
        ORDER BY a.data_adocao DESC
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $adocoes = [];
    while ($row = $result->fetch_assoc()) {
        // Contar entradas do diário
        $countStmt = $conn->prepare("SELECT COUNT(*) as total FROM pos_adocao_diario WHERE adocao_id = ?");
        $countStmt->bind_param("i", $row["adocao_id"]);
        $countStmt->execute();
        $countResult = $countStmt->get_result()->fetch_assoc();

        $adocoes[] = [
            "adocao_id"     => $row["adocao_id"],
            "data_adocao"   => $row["data_adocao"],
            "status"        => $row["status"],
            "total_diario"  => intval($countResult["total"]),
            "pet" => [
                "id"        => $row["pet_id"],
                "nome"      => $row["name"],
                "descricao" => $row["description"],
                "foto"      => resolveImage($row["image"], $baseUrl),
                "idade"     => $row["age"],
                "especie"   => $row["breed"],
                "local"     => $row["location"],
                "porte"     => $row["size"],
                "sexo"      => $row["gender"],
                "contato"   => $row["contact"],
                "vacinado"  => $row["vaccinated"],
                "castrado"  => $row["neutered"],
            ],
        ];
    }

    echo json_encode(["success" => true, "adocoes" => $adocoes, "total" => count($adocoes)]);
    exit;
}

// ── POST: Criar entrada no diário ──
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input) $input = $_POST;

    $adocao_id = intval($input["adocao_id"] ?? 0);
    $titulo    = trim($input["titulo"] ?? "");
    $descricao = trim($input["descricao"] ?? "");
    $tipo      = $input["tipo"] ?? "nota";

    if (!$adocao_id || !$titulo) {
        echo json_encode(["success" => false, "message" => "adocao_id e titulo são obrigatórios"]);
        exit;
    }

    // Validar tipo
    $tiposValidos = ["nota", "vacina", "consulta", "marco"];
    if (!in_array($tipo, $tiposValidos)) {
        $tipo = "nota";
    }

    // Verificar se a adoção pertence ao usuário
    $checkStmt = $conn->prepare("SELECT id FROM adocoes WHERE id = ? AND user_id = ?");
    $checkStmt->bind_param("ii", $adocao_id, $user_id);
    $checkStmt->execute();
    if ($checkStmt->get_result()->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Adoção não encontrada ou não pertence a você"]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO pos_adocao_diario (adocao_id, titulo, descricao, tipo) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $adocao_id, $titulo, $descricao, $tipo);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Entrada adicionada ao diário!",
            "id" => $conn->insert_id,
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao salvar: " . $conn->error]);
    }
    exit;
}

// ── DELETE: Remover entrada do diário ──
if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    $input = json_decode(file_get_contents("php://input"), true);
    $entrada_id = intval($input["entrada_id"] ?? 0);

    if (!$entrada_id) {
        echo json_encode(["success" => false, "message" => "entrada_id obrigatório"]);
        exit;
    }

    // Verificar se a entrada pertence a uma adoção do usuário
    $checkStmt = $conn->prepare("
        SELECT d.id FROM pos_adocao_diario d
        INNER JOIN adocoes a ON d.adocao_id = a.id
        WHERE d.id = ? AND a.user_id = ?
    ");
    $checkStmt->bind_param("ii", $entrada_id, $user_id);
    $checkStmt->execute();
    if ($checkStmt->get_result()->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Entrada não encontrada"]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM pos_adocao_diario WHERE id = ?");
    $stmt->bind_param("i", $entrada_id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Entrada removida"]);
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao remover"]);
    }
    exit;
}

echo json_encode(["success" => false, "message" => "Método não permitido"]);
?>
