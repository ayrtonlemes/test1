import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import { Box } from "@mui/material";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineGraphProps {
  selectedSensor: { typeSensor: string }; // O nome do sensor
  data: number[]; // Dados do sensor (vetor de números)
}

const LineGraph: React.FC<LineGraphProps> = ({ selectedSensor, data }) => {
  // Se os dados estiverem vazios, exibe uma mensagem de erro ou vazio
  
  if (!data || data.length === 0) {
    return <div>Sem dados para exibir no gráfico.</div>;
  }

  // Mapear os dados para o formato necessário pelo Chart.js
  const labels = data.map((_, index) => `${index + 1}`); // Criar labels como 1, 2, 3,... para os dados

  // Configurações do gráfico
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: selectedSensor.typeSensor, // Nome do sensor como label
        data: data, // Dados do sensor
        borderColor: "rgba(75,192,192,1)", // Cor da linha
        backgroundColor: "rgba(75,192,192,0.2)", // Cor de fundo
        pointRadius: 3, // Raio do ponto no gráfico
        tension: 0.4, // Curvatura da linha
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Valores do Sensor ao Longo do Tempo", // Título do gráfico
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Índice dos Dados", // Título do eixo X (com base no índice dos dados)
        },
      },
      y: {
        title: {
          display: true,
          text: "Valor do Sensor", // Título do eixo Y
        },
        min: Math.min(...data) - Math.min(...data)/2, // Valor mínimo no eixo Y
        max: Math.max(...data) + Math.min(...data)/2, // Valor máximo no eixo Y
      },
    },
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Line data={chartData} options={options} />
    </Box>
  );
};

export default LineGraph;
