<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "adocao");
if ($conn->connect_error) {
    echo json_encode(["erro" => "Conexão falhou: " . $conn->connect_error]);
    exit;
}

$result = [];

// 1. Listar tabelas do banco
$tables = [];
$res = $conn->query("SHOW TABLES");
while ($row = $res->fetch_row()) {
    $tables[] = $row[0];
}
$result["tabelas"] = $tables;

// 2. Colunas da tabela pets
if (in_array("pets", $tables)) {
    $cols = [];
    $res2 = $conn->query("DESCRIBE pets");
    while ($row = $res2->fetch_assoc()) {
        $cols[] = $row;
    }
    $result["colunas_pets"] = $cols;

    // 3. Primeiros 3 pets
    $petsData = [];
    $res3 = $conn->query("SELECT * FROM pets LIMIT 3");
    while ($row = $res3->fetch_assoc()) {
        $petsData[] = $row;
    }
    $result["exemplo_pets"] = $petsData;
}

// 4. Colunas da tabela matches (se existir)
if (in_array("matches", $tables)) {
    $colsM = [];
    $res4 = $conn->query("DESCRIBE matches");
    while ($row = $res4->fetch_assoc()) {
        $colsM[] = $row;
    }
    $result["colunas_matches"] = $colsM;

    // 5. Alguns matches
    $matchData = [];
    $res5 = $conn->query("SELECT * FROM matches LIMIT 5");
    while ($row = $res5->fetch_assoc()) {
        $matchData[] = $row;
    }
    $result["exemplo_matches"] = $matchData;
} else {
    $result["colunas_matches"] = "TABELA MATCHES NÃO EXISTE!";
}

// 6. Colunas da tabela users
if (in_array("users", $tables)) {
    $colsU = [];
    $res6 = $conn->query("DESCRIBE users");
    while ($row = $res6->fetch_assoc()) {
        $colsU[] = $row;
    }
    $result["colunas_users"] = $colsU;
}

// 7. Colunas da tabela ongs
if (in_array("ongs", $tables)) {
    $colsO = [];
    $res7 = $conn->query("DESCRIBE ongs");
    while ($row = $res7->fetch_assoc()) {
        $colsO[] = $row;
    }
    $result["colunas_ongs"] = $colsO;
    
    $ongData = [];
    $res8 = $conn->query("SELECT id, nome, email FROM ongs LIMIT 5");
    while ($row = $res8->fetch_assoc()) {
        $ongData[] = $row;
    }
    $result["exemplo_ongs"] = $ongData;
} else {
    $result["colunas_ongs"] = "TABELA ONGS NÃO EXISTE!";
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
