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
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20; // Tamanho do datetime carregado para a página
$min = isset($_GET['min']) ? (int)$_GET['min'] : 0; // Posição inicial dos resultados

// Verifica se o id_patient foi fornecido
if ($id_patient === null) {
    echo json_encode(['error' => 'ID do paciente não fornecido.']);
    exit;
}

// Cria a conexão com o MySQL
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica se a conexão foi bem-sucedida
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}


// Prepara a consulta SQL com o id do paciente
$sql = "SELECT datetime FROM glicodex_data WHERE id_patient = ? LIMIT ? OFFSET ?";
$stmt = $conn->prepare($sql);

// Verifica se a preparação da consulta foi bem-sucedida
if ($stmt === false) {
    echo json_encode(['error' => 'Erro na preparação da consulta.']);
    exit;
}

// Vincula o parâmetro id_patient à consulta
$stmt->bind_param("iii", $id_patient,$limit, $min); // "i" indica que é um inteiro

// Executa a consulta
$stmt->execute();

// Obtemos os resultados
$result = $stmt->get_result();

// Cria um array para armazenar os dados
$patient_datetime_data = array();

// Verifica se há resultados e os armazena no array
while ($row = $result->fetch_assoc()) {
    $patient_datetime_data[] = $row;
}

// Retorna os dados em formato JSON
echo json_encode($patient_datetime_data);

// Fecha a conexão com o banco de dados
$stmt->close();
$conn->close();
?>
