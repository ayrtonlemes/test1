<?php
// Defina as credenciais do banco de dados
$servername = "192.168.100.3"; // ou o endereço do seu servidor MySQL
$username = "root"; // seu usuário do banco
$password = ""; // sua senha do banco
$dbname = "glicose"; // nome do seu banco de dados


header("Access-Control-Allow-Origin: http://192.168.100.3:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


// Cria a conexão com o MySQL
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica se a conexão foi bem-sucedida
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

// Prepara a consulta SQL com o id do paciente
$sql = "SELECT * FROM patient";
$stmt = $conn->prepare($sql);

// Verifica se a preparação da consulta foi bem-sucedida
if ($stmt === false) {
    echo json_encode(['error' => 'Erro na preparação da consulta.']);
    exit;
}

// Vincula o parâmetro id_patient à consulta

// Executa a consulta
$stmt->execute();

// Obtemos os resultados
$result = $stmt->get_result();

// Cria um array para armazenar os dados
$patient_list = array();

// Verifica se há resultados e os armazena no array
while ($row = $result->fetch_assoc()) {
    $patient_list[] = $row;
}

// Retorna os dados em formato JSON
echo json_encode($patient_list);

// Fecha a conexão com o banco de dados
$stmt->close();
$conn->close();
?>
