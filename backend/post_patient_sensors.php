<?php
// Configurações de conexão com o banco de dados
$servername = "localhost"; // endereço do servidor MySQL
$username = "root"; // usuário do banco
$password = ""; // senha do banco
$dbname = "glicose"; // nome do banco de dados

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Recebe os dados enviados via POST (JSON)
$data = json_decode(file_get_contents("php://input"), true);

// Verifica se a decodificação do JSON foi bem-sucedida
if ($data === null) {
    echo json_encode(['error' => 'Erro ao decodificar JSON.']);
    exit;
}

var_dump($data);

// Acessa os dados do JSON
$sensor_type = isset($data['sensor']) ? $data['sensor'] : null;
$datetime = isset($data['datetime']) ? $data['datetime'] : null;
$sensor_data = isset($data['sensor_type']) ? $data['sensor_type'] : null;
$id_patient = isset($data['id_patient']) ? $data['id_patient'] : null;

// Verifica se todos os parâmetros obrigatórios foram fornecidos
if ($sensor_type === null || $datetime === null || $sensor_data === null || $id_patient === null) {
    echo json_encode(['error' => 'Parâmetros insuficientes.']);
    exit;
}

// Conexão com o banco de dados
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica se houve erro na conexão
if ($conn->connect_error) {
    die(json_encode(['error' => "Falha na conexão: " . $conn->connect_error]));
}

// Define a tabela com base no tipo de sensor
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

// Prepara a consulta SQL para inserção com base no tipo de sensor
$sql = "";
$stmt = null;

switch ($sensor_type) {
    case 'acc':
        $sql = "INSERT INTO $table (id_patient, datetime, acc_x, acc_y, acc_z) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "issdd",
            $id_patient,
            $datetime,
            $sensor_data['acc']['acc_x'], // Agora acessando os dados de acc_x, acc_y, acc_z corretamente
            $sensor_data['acc']['acc_y'],
            $sensor_data['acc']['acc_z']
        );
        break;
    case 'bvp':
    case 'eda':
    case 'glicodex':
    case 'hr':
    case 'ibi':
    case 'temp':
        $column = $sensor_type; // A coluna tem o mesmo nome do sensor
        $sql = "INSERT INTO $table (id_patient, datetime, $column) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("isd", $id_patient, $datetime, $sensor_data[$sensor_type]); // Agora usando o valor correto
        break;
    default:
        echo json_encode(['error' => 'Erro ao configurar consulta.']);
        exit;
}

// Executa a consulta
if ($stmt && $stmt->execute()) {
    echo json_encode(['success' => 'Dados inseridos com sucesso.']);
} else {
    echo json_encode(['error' => 'Falha ao inserir os dados.', 'details' => $stmt->error]);
}

// Fecha a conexão
$stmt->close();
$conn->close();
?>
