<?php
// Defina as credenciais do banco de dados
$servername = "26.161.62.200"; // ou o endereço do seu servidor MySQL
$username = "root"; // seu usuário do banco
$password = ""; // sua senha do banco
$dbname = "glicose"; // nome do seu banco de dados

header("Access-Control-Allow-Origin: http://26.161.62.200:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Verifica se o id foi passado via GET ou POST
$id_patient = isset($_GET['id']) ? $_GET['id'] : null;
$sensor_type = isset($_GET['sensor']) ? $_GET['sensor'] : null;
$datetime_selected = isset($_GET['datetime']) ? $_GET['datetime'] : null;


function calcularMedia($data, $step = 25) {
    $averagedData = [];
    for ($i = 0; $i < count($data); $i += $step) {
        $chunk = array_slice($data, $i, $step);
        $average = array_sum($chunk) / count($chunk);
        $averagedData[] = round($average, 3); // Arredonda para 3 casas decimais
    }
    return $averagedData;
}

// Verifica se os parâmetros obrigatórios foram fornecidos
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
        $interval_minutes = 1; // Intervalo de 1 minuto para o acelerômetro
        break;
    case 'bvp':
        $table = 'bvp_data';
        $interval_minutes = 5;
        break;
    case 'eda':
        $table = 'eda_data';
        $interval_minutes = 5;
        break;
    case 'glicodex':
        $table = 'glicodex_data';
        $interval_minutes = 5;
        break;
    case 'hr':
        $table = 'hr_data';
        $interval_minutes = 5;
        break;
    case 'ibi':
        $table = 'ibi_data';
        $interval_minutes = 5;
        break;
    case 'temp':
        $table = 'temp_data';
        $interval_minutes = 5;
        break;
    default:
        echo json_encode(['error' => 'Tipo de sensor inválido.']);
        exit;
}

// Tratamento do intervalo
$datetime_obj = new DateTime($datetime_selected);
$datetime_obj->modify("-$interval_minutes minutes");
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
$stmt->bind_param("iss", $id_patient, $datetime_before, $datetime_selected);

// Executa a consulta
$stmt->execute();

// Obtemos os resultados
$result = $stmt->get_result();

if ($sensor_type == 'acc') {
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
            $sensor_value = $row['bvp'];
            break;
        case 'eda':
            $sensor_value = $row['eda'];
            break;
        case 'glicodex':
            $sensor_value = $row['glicodex'];
            break;
        case 'hr':
            $sensor_value = $row['hr'];
            break;
        case 'ibi':
            $sensor_value = $row['ibi'];
            break;
        case 'temp':
            $sensor_value = $row['temp'];
            break;
        default:
            $sensor_value = null;
            break;
    }

    if ($sensor_value !== null) {
        $sensor_data[] = $sensor_value;
    }
}

// Para o acelerômetro, organiza os dados em três arrays separados


if ($sensor_type == 'acc') {
    $acc_x_reduced = calcularMedia($acc_x_data);
    $acc_y_reduced = calcularMedia($acc_y_data);
    $acc_z_reduced = calcularMedia($acc_z_data);

    $sensor_data = [
        'acc_x' => $acc_x_reduced,
        'acc_y' => $acc_y_reduced,
        'acc_z' => $acc_z_reduced
    ];
}


// Retorna os dados em formato JSON
echo json_encode($sensor_data);

// Fecha a conexão com o banco de dados
$stmt->close();
$conn->close();
?>
