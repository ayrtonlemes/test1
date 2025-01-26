<?php
// Defina as credenciais do banco de dados
$servername = "26.161.62.200"; // ou o endereço do seu servidor MySQL
$username = "root"; // seu usuário do banco
$password = ""; // sua senha do banco
$dbname = "glicose"; // nome do seu banco de dados

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Para requisições OPTIONS (pré-fluxo CORS), você pode terminar a execução
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0); // Apenas responde ao pré-fluxo e não processa a requisição
}

// Verifica se os parâmetros foram passados via GET ou POST
$id_patient = isset($_GET['id']) ? $_GET['id'] : null; // ID do paciente
$datetime = isset($_GET['datetime']) ? $_GET['datetime'] : null; // Datetime completo

// Verifica se o id_patient foi fornecido
if ($id_patient === null) {
    echo json_encode(['error' => 'ID do paciente não fornecido.']);
    exit;
}

// Verifica se o datetime foi fornecido
if ($datetime === null) {
    echo json_encode(['error' => 'Datetime não fornecido.']);
    exit;
}

// Cria a conexão com o MySQL
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica se a conexão foi bem-sucedida
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

// Prepara a consulta SQL com base no parâmetro `only_date`
// Consulta para comparar apenas a data
$sql = "SELECT * FROM food_data WHERE id_patient = ? AND DATE(time_begin) = DATE(?)";

// Prepara a consulta
$stmt = $conn->prepare($sql);

// Verifica se a preparação da consulta foi bem-sucedida
if ($stmt === false) {
    echo json_encode(['error' => 'Erro na preparação da consulta.']);
    exit;
}

// Vincula os parâmetros id_patient e datetime à consulta
$stmt->bind_param("is", $id_patient, $datetime); // "i" para inteiro, "s" para string

// Executa a consulta
$stmt->execute();

// Obtemos os resultados
$result = $stmt->get_result();

// Cria um array para armazenar os dados
$food_data = array();

// Verifica se há resultados e os armazena no array
while ($row = $result->fetch_assoc()) {
    $food_data[] = $row;
}

// Retorna os dados em formato JSON
echo json_encode($food_data);

// Fecha a conexão com o banco de dados
$stmt->close();
$conn->close();
?>
