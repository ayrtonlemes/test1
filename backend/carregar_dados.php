<?php
// Configuração do banco de dados
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "glicose";

// Conexão com o banco
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexão
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

// Capturar os dados JSON enviados
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Verificar se os parâmetros necessários foram enviados
if (!isset($data['arquivo']) || !isset($data['tabela'])) {
    echo json_encode(["success" => false, "error" => "Parâmetros inválidos."]);
    exit;
}

$arquivo = $data['arquivo'];
$tabela = $data['tabela'];

// Mapear cada tabela com suas colunas específicas
$colunas = [
    "patient" => "id_patient, name, age, gender",
    "ibi_data" => "id_patient, datetime, ibi",
    "eda_data" => "id_patient, datetime, eda",
    "glicodex_data" => "id_patient, datetime, value_gluco",
    "temp_data" => "id_patient, datetime, temp",
    "bvp_data" => "id_patient, datetime, bvp",
    "acc_data" => "id_patient, datetime, acc_x, acc_y, acc_z",
    "hr_data" => "id_patient, datetime, hr",
    "food_data" => "id_sec_data, id_patient, registro_date, registro_time, time_begin, time_end, logged_food, calorie, carbo, sugar, protein",
];

// Verificar se a tabela fornecida existe no mapeamento
if (!array_key_exists($tabela, $colunas)) {
    echo json_encode(["success" => false, "error" => "Tabela não reconhecida."]);
    exit;
}

try {
    // Comando LOAD DATA INFILE com colunas mapeadas
    $sql = "LOAD DATA LOCAL INFILE ?
            INTO TABLE $tabela
            FIELDS TERMINATED BY ',' 
            ENCLOSED BY '\"'
            LINES TERMINATED BY '\\n'
            IGNORE 1 ROWS
            (" . $colunas[$tabela] . ")";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $arquivo);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Arquivo carregado com sucesso na tabela $tabela!"]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

$conn->close();
?>
