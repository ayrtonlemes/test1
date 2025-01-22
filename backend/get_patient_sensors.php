<?php
// Defina as credenciais do banco de dados
$servername = "localhost"; // ou o endereço do seu servidor MySQL
$username = "root"; // seu usuário do banco
$password = ""; // sua senha do banco
$dbname = "glicose"; // nome do seu banco de dados

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Verifica se o id foi passado via GET ou POST
$id_patient = isset($_GET['id']) ? $_GET['id'] : null; // Usando GET, pode usar POST dependendo da sua implementação
$sensor_type = isset($_GET['sensor']) ? $_GET['sensor'] : null; // Tipo de sensor
$datetime_selected = isset($_GET['datetime']) ? $_GET['datetime'] : null; // DateTime selecionado
$interval_minutes = 5; // Intervalo fixo de 5 minutos

// Verifica se o id_patient foi fornecido
if ($id_patient === null) {
    echo json_encode(['error' => 'ID do paciente não fornecido.']);
    exit;
}

if ($sensor_type === null) {
    echo json_encode(['error' => 'Tipo de sensor não fornecido.']);
    exit;
}

if ($datetime_selected === null) {
    echo json_encode(['error' => 'Data e hora não fornecidos.']);
    exit;
}

// Cria a conexão com o MySQL
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica se a conexão foi bem-sucedida
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

// Definir a tabela de acordo com o tipo de sensor
switch ($sensor_type) {
    case 'acc':
        $table = 'acc_data';
        break;
    case 'bvp':
        $table = 'bvp_data';
        break;
    case 'eda':
        $table = 'eda_data';
        break;
    case 'glicodex':
        $table = 'glicodex_data';
        break;
    case 'hr':
        $table = 'hr_data';
        break;
    case 'ibi':
        $table = 'ibi_data';
        break;
    case 'temp':
        $table = 'temp_data';
        break;

    default:
        echo json_encode(['error' => 'Tipo de sensor inválido.']);
        exit;
}

//Tratamento dos 5 minutos
$datetime_obj = new Datetime($datetime_selected);
$datetime_obj->modify('-5 minutes'); // Subtrai 5 minutos
$datetime_before = $datetime_obj->format('Y-m-d H:i:s');

// Prepara a consulta SQL com o id do paciente
$sql = "SELECT * FROM $table WHERE id_patient = ? AND datetime BETWEEN ? AND ?";
$stmt = $conn->prepare($sql);

// Verifica se a preparação da consulta foi bem-sucedida
if ($stmt === false) {
    echo json_encode(['error' => 'Erro na preparação da consulta.']);
    exit;
}

// Vincula o parâmetro id_patient à consulta
$stmt->bind_param("iss", $id_patient, $datetime_before, $datetime_selected); // "i" indica que é um inteiro

// Executa a consulta
$stmt->execute();

// Obtemos os resultados
$result = $stmt->get_result();

if($sensor_type == 'acc') {
    
    $acc_x_data = [];
    $acc_y_data = [];
    $acc_z_data = [];

}


// Cria um array para armazenar os dados do sensor
$sensor_data = array();

// Verifica se há resultados e os armazena no array
while ($row = $result->fetch_assoc()) {
    $sensor_value = null;

    // Exemplo genérico: captura o valor do sensor de acordo com o tipo solicitado
    switch ($sensor_type) {
        case 'acc':
            // Adiciona os valores das colunas acc_x, acc_y, acc_z aos respectivos arrays
            if (isset($row['acc_x'])) {
                $acc_x_data[] = $row['acc_x'];
            }
            if (isset($row['acc_y'])) {
                $acc_y_data[] = $row['acc_y'];
            }
            if (isset($row['acc_z'])) {
                $acc_z_data[] = $row['acc_z'];
            }
            break;

        case 'bvp':
            $sensor_value = $row['bvp']; // Valor do BVP
            break;
        case 'eda':
            $sensor_value = $row['eda']; // Valor do EDA
            break;
        case 'glicodex':
            $sensor_value = $row['glicodex']; // Valor do Glicodex
            break;
        case 'hr':
            $sensor_value = $row['hr']; // Valor do HR
            break;
        case 'ibi':
            $sensor_value = $row['ibi']; // Valor do IBI
            break;
        case 'temp':
            $sensor_value = $row['temp']; // Valor da temperatura
            break;
        default:
            $sensor_value = null;
            break;
    }

    // Adiciona o valor do sensor ao array se houver
    if ($sensor_value !== null) {
        $sensor_data[] = $sensor_value;
    }
}

if ($sensor_type == 'acc') {
    $sensor_data = [
        'acc_x' => $acc_x_data,
        'acc_y' => $acc_y_data,
        'acc_z' => $acc_z_data
    ];
}

// Retorna os dados em formato JSON
echo json_encode($sensor_data);

// Fecha a conexão com o banco de dados
$stmt->close();
$conn->close();
?>
