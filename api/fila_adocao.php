<?php
session_start();
require_once __DIR__ . '/cors.php';
include "config.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    // Listar fila de um pet ou de um usuário
    $pet_id = $_GET["pet_id"] ?? null;
    $user_id = $_GET["user_id"] ?? null;

    if ($pet_id) {
        $stmt = $conn->prepare("SELECT f.*, u.nome as user_nome FROM fila_adocao f JOIN users u ON f.user_id = u.id WHERE f.pet_id = ? AND f.status = 'na_fila' ORDER BY f.posicao ASC");
        $stmt->bind_param("i", $pet_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $fila = [];
        while ($row = $result->fetch_assoc()) {
            $fila[] = $row;
        }
        echo json_encode(["success" => true, "fila" => $fila]);
    } elseif ($user_id) {
        $stmt = $conn->prepare("SELECT f.*, p.name as pet_nome, p.image as pet_foto FROM fila_adocao f JOIN pets p ON f.pet_id = p.id WHERE f.user_id = ? ORDER BY f.created_at DESC");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $filas = [];
        while ($row = $result->fetch_assoc()) {
            $filas[] = $row;
        }
        echo json_encode(["success" => true, "filas" => $filas]);
    } else {
        echo json_encode(["success" => false, "message" => "pet_id ou user_id necessário"]);
    }
    exit;
}

if ($method === "POST") {
    $input = json_decode(file_get_contents("php://input"), true);
    $action = $input["action"] ?? "entrar";
    $pet_id = intval($input["pet_id"] ?? 0);
    $user_id = intval($input["user_id"] ?? 0);

    if (!$pet_id || !$user_id) {
        echo json_encode(["success" => false, "message" => "pet_id e user_id obrigatórios"]);
        exit;
    }

    if ($action === "entrar") {
        // Entrar na fila de adoção
        $mensagem = $input["mensagem"] ?? "";

        // Verificar se já está na fila
        $checkStmt = $conn->prepare("SELECT id FROM fila_adocao WHERE pet_id = ? AND user_id = ? AND status = 'na_fila'");
        $checkStmt->bind_param("ii", $pet_id, $user_id);
        $checkStmt->execute();
        $checkStmt->store_result();
        if ($checkStmt->num_rows > 0) {
            echo json_encode(["success" => false, "message" => "Você já está na fila para este pet"]);
            exit;
        }

        // Calcular posição
        $posStmt = $conn->prepare("SELECT COUNT(*) as total FROM fila_adocao WHERE pet_id = ? AND status = 'na_fila'");
        $posStmt->bind_param("i", $pet_id);
        $posStmt->execute();
        $posResult = $posStmt->get_result()->fetch_assoc();
        $posicao = intval($posResult["total"]) + 1;

        $stmt = $conn->prepare("INSERT INTO fila_adocao (pet_id, user_id, status, posicao, mensagem) VALUES (?, ?, 'na_fila', ?, ?)");
        $stmt->bind_param("iiis", $pet_id, $user_id, $posicao, $mensagem);

        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Você entrou na fila de adoção!",
                "posicao" => $posicao
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Erro: " . $conn->error]);
        }
    } elseif ($action === "cancelar") {
        // Sair da fila
        $stmt = $conn->prepare("UPDATE fila_adocao SET status = 'cancelado' WHERE pet_id = ? AND user_id = ? AND status = 'na_fila'");
        $stmt->bind_param("ii", $pet_id, $user_id);
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Você saiu da fila"]);
        } else {
            echo json_encode(["success" => false, "message" => "Erro: " . $conn->error]);
        }
    } elseif ($action === "confirmar") {
        // Confirmar adoção (marca pet como adotado, cancela demais da fila)
        $stmt = $conn->prepare("UPDATE fila_adocao SET status = 'confirmado' WHERE pet_id = ? AND user_id = ? AND status = 'na_fila'");
        $stmt->bind_param("ii", $pet_id, $user_id);
        $stmt->execute();

        // Cancelar todos os outros na fila
        $cancelStmt = $conn->prepare("UPDATE fila_adocao SET status = 'expirado' WHERE pet_id = ? AND user_id != ? AND status = 'na_fila'");
        $cancelStmt->bind_param("ii", $pet_id, $user_id);
        $cancelStmt->execute();

        // Marcar pet como adotado
        $adoptStmt = $conn->prepare("UPDATE pets SET adotado = 1 WHERE id = ?");
        $adoptStmt->bind_param("i", $pet_id);
        $adoptStmt->execute();

        echo json_encode(["success" => true, "message" => "Adoção confirmada!"]);
    }
    exit;
}

echo json_encode(["success" => false, "message" => "Método não suportado"]);
