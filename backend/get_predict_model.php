<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$scriptPath = 'C:\xampp\htdocs\glicose_super\meu_script_modelo.py';
$csvFile = 'C:\xampp\htdocs\glicose_super\predicao1.csv';

try {
    // Executa o script Python (que executa o modelo IA)
    $output = shell_exec("python3 $scriptPath 2>&1");    
    // Verifica se o script Python finalizou e gerou o arquivo CSV
    if (!file_exists($csvFile)) {
        throw new Exception("Arquivo CSV não encontrado após a execução do script.");
    }

    // Lê o conteúdo do arquivo CSV
    $dados = [];
    if (($handle = fopen($csvFile, "r")) !== false) {
        while (($linha = fgetcsv($handle, 1000, ",")) !== false) {
            $dados[] = $linha;
        }
        fclose($handle);
    }

    // Retorna os dados como JSON
    echo json_encode($dados);
} catch (Exception $e) {
    // Retorna erro
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
