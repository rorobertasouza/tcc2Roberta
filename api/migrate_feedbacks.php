<?php
/**
 * Migration: Add columns for feedback improvements
 * Run once: http://localhost/find-animal-friend-react/api/migrate_feedbacks.php
 */
include "config.php";

$queries = [
    // Pets: biography fields
    "ALTER TABLE pets ADD COLUMN IF NOT EXISTS origem VARCHAR(100) DEFAULT NULL AFTER contact",
    "ALTER TABLE pets ADD COLUMN IF NOT EXISTS motivo_adocao TEXT DEFAULT NULL AFTER origem",
    "ALTER TABLE pets ADD COLUMN IF NOT EXISTS data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP AFTER motivo_adocao",

    // Users: location fallback + has pet
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS tem_pet VARCHAR(20) DEFAULT '' AFTER aceita_especial",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS cidade VARCHAR(100) DEFAULT '' AFTER tem_pet",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS estado VARCHAR(2) DEFAULT '' AFTER cidade",

    // Adoption queue table
    "CREATE TABLE IF NOT EXISTS fila_adocao (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pet_id INT NOT NULL,
        user_id INT NOT NULL,
        status ENUM('na_fila','confirmado','cancelado','expirado') DEFAULT 'na_fila',
        posicao INT DEFAULT 1,
        mensagem TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_pet (user_id, pet_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
];

$results = [];
foreach ($queries as $sql) {
    if ($conn->query($sql)) {
        $results[] = ["ok" => true, "sql" => substr($sql, 0, 80) . "..."];
    } else {
        $results[] = ["ok" => false, "sql" => substr($sql, 0, 80) . "...", "error" => $conn->error];
    }
}

header("Content-Type: application/json");
echo json_encode(["results" => $results], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
