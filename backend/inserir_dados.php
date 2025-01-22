<?php
// Configuração do banco de dados
$servername = "localhost";
$username = "root"; // Usuário padrão do XAMPP
$password = ""; // Senha padrão do XAMPP
$dbname = "glicose"; // Nome do banco atualizado

// Conexão com o banco
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexão
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

// Capturar os dados JSON enviados
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Verificar se os dados foram recebidos corretamente
if (!isset($data['tabela']) || !isset($data['dados'])) {
    echo "Dados inválidos.";
    exit;
}

$tabela = $data['tabela'];
$dados = $data['dados'];

if ($tabela === "patient") {
    // Inserir dados na tabela patient
    $sql = "INSERT INTO patient (id_patient, name, age, gender) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isis", $dados['id_patient'], $dados['name'], $dados['age'], $dados['gender']);

} elseif ($tabela === "ibi_data") {
    // Inserir dados na tabela sensor_ibi
    $sql = "INSERT INTO ibi_data (id_patient, `datetime`, ibi) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isd", $dados['id_patient'], $dados['datetime'], $dados['ibi']);

} elseif ($tabela === "eda_data") {
    // Inserir dados na tabela sensor_eda
    $sql = "INSERT INTO eda_data (id_patient, `datetime`, eda) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isd", $dados['id_patient'], $dados['datetime'], $dados['eda']);

} elseif ($tabela === "glicodex_data") {
    // Inserir dados na tabela sensor_glicodex
    $sql = "INSERT INTO glicodex_data (id_patient, `datetime`, value_gluco) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isd", $dados['id_patient'], $dados['datetime'], $dados['value_gluco']);

} elseif ($tabela === "temp_data") {
    // Inserir dados na tabela sensor_temp
    $sql = "INSERT INTO temp_data (id_patient, `datetime`, temp) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isd", $dados['id_patient'], $dados['datetime'], $dados['temp']);

} elseif ($tabela === "bvp_data") {
    // Inserir dados na tabela sensor_bvp
    $sql = "INSERT INTO bvp_data (id_patient, `datetime`, bvp) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isd", $dados['id_patient'], $dados['datetime'], $dados['bvp']);

} elseif ($tabela === "acc_data") {
    // Inserir dados na tabela sensor_acc
    $sql = "INSERT INTO acc_data (id_patient, `datetime`, acc_x, acc_y, acc_z) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isddd", $dados['id_patient'], $dados['datetime'], $dados['acc_x'], $dados['acc_y'], $dados['acc_z']);

} elseif ($tabela === "hr_data") {
    // Inserir dados na tabela sensor_hr
    $sql = "INSERT INTO hr_data (id_patient, `datetime`, hr) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("isd", $dados['id_patient'], $dados['datetime'], $dados['hr']);

} elseif ($tabela === "food_data") {
    // Inserir dados na tabela food_data
    $sql = "INSERT INTO food_data (id_sec_data, id_patient, registro_date, registro_time, time_begin, time_end, logged_food, calorie, carbo, sugar, protein)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iisssssdddd",
        $dados['id_sec_data'], $dados['id_patient'], $dados['registro_date'], $dados['registro_time'],
        $dados['time_begin'], $dados['time_end'], $dados['logged_food'], $dados['calorie'],
        $dados['carbo'], $dados['sugar'], $dados['protein']
    );
} else {
    echo "Tabela não reconhecida.";
    exit;
}

// Executar e verificar o resultado
if ($stmt->execute()) {
    echo "Dados inseridos com sucesso na tabela $tabela!";
} else {
    echo "Erro ao inserir dados: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
