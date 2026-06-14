<?php
require_once __DIR__ . '/cors.php';

// Diretório de uploads
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Tipos permitidos
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$maxSize = 5 * 1024 * 1024; // 5 MB

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método não permitido"]);
    exit;
}

if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE   => "Arquivo excede o limite do servidor",
        UPLOAD_ERR_FORM_SIZE  => "Arquivo excede o limite do formulário",
        UPLOAD_ERR_PARTIAL    => "Upload incompleto",
        UPLOAD_ERR_NO_FILE    => "Nenhum arquivo enviado",
        UPLOAD_ERR_NO_TMP_DIR => "Diretório temporário não encontrado",
        UPLOAD_ERR_CANT_WRITE => "Erro ao gravar arquivo",
    ];
    $errCode = $_FILES['foto']['error'] ?? UPLOAD_ERR_NO_FILE;
    $msg = $errorMessages[$errCode] ?? "Erro desconhecido no upload";
    echo json_encode(["success" => false, "message" => $msg]);
    exit;
}

$file = $_FILES['foto'];

// Validar tipo
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);

if (!in_array($mimeType, $allowedTypes)) {
    echo json_encode([
        "success" => false,
        "message" => "Formato não permitido. Use JPG, PNG, WebP ou GIF."
    ]);
    exit;
}

// Validar tamanho
if ($file['size'] > $maxSize) {
    echo json_encode([
        "success" => false,
        "message" => "Arquivo muito grande. Máximo: 5 MB."
    ]);
    exit;
}

// Gerar nome único
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
if (empty($ext)) {
    $extMap = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
    ];
    $ext = $extMap[$mimeType] ?? 'jpg';
}
$newName = 'pet_' . uniqid() . '_' . time() . '.' . strtolower($ext);
$destPath = $uploadDir . $newName;

// Mover arquivo
if (move_uploaded_file($file['tmp_name'], $destPath)) {
    // Retornar caminho relativo (será resolvido pela resolveImage)
    $relativePath = 'uploads/' . $newName;
    echo json_encode([
        "success" => true,
        "message" => "Upload realizado com sucesso",
        "path"    => $relativePath,
        "url"     => $relativePath,
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Erro ao salvar arquivo no servidor"
    ]);
}
