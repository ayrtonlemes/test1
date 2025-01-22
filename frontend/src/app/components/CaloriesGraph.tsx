import React, { useState, useRef, useEffect } from "react";
import { Box, FormControlLabel, Checkbox, Typography, FormGroup } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import mockedCaloriesPatients from "../mocks/patient001_food_log.json";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CaloriesGraphDonut() {
  const [itemNb, setItemNb] = useState(1);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const chartRef = useRef<any>(null); // Ref para o gráfico

  const handleItemNbChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue !== "number") {
      return;
    }
    setItemNb(newValue);
  };

  const patientFoodLog = [
    { label: "calorie", data: mockedCaloriesPatients.map((row) => row.calorie || 0) },
    { label: "total_carb", data: mockedCaloriesPatients.map((row) => row.total_carb || 0) },
    { label: "dietary_fiber", data: mockedCaloriesPatients.map((row) => row.dietary_fiber || 0) },
    { label: "sugar", data: mockedCaloriesPatients.map((row) => row.sugar || 0) },
    { label: "protein", data: mockedCaloriesPatients.map((row) => row.protein || 0) },
    { label: "total_fat", data: mockedCaloriesPatients.map((row) => row.total_fat || 0) },
  ];

  const handleCheckboxChange = (label: string) => {
    setSelectedSeries((prevSelected) =>
      prevSelected.includes(label)
        ? prevSelected.filter((s) => s !== label)
        : [...prevSelected, label]
    );
  };

  const filteredSeries = patientFoodLog
    .filter((s) => selectedSeries.includes(s.label))
    .map((s) => ({
      ...s,
      data: s.data.slice(0, itemNb),
    }));

  // Preparando os dados para o gráfico de donut
  const chartData = {
    labels: filteredSeries.map((s) => s.label),
    datasets: [
      {
        data: filteredSeries.map((s) => s.data.reduce((acc, value) => acc + value, 0)), // Soma dos valores de cada série
        backgroundColor: ["#FF6347", "#3baf9f", "#ffcd56", "#ff9f40", "#36a2eb", "#4bc0c0"], // Cores diferentes para cada segmento
      },
    ],
  };

  // Função para redimensionar o gráfico quando o tamanho do contêiner mudar
  const handleResize = () => {
    if (chartRef.current) {
      chartRef.current.chartInstance.resize(); // Força o gráfico a se redimensionar
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize); // Adiciona o evento de resize
    return () => {
      window.removeEventListener("resize", handleResize); // Limpeza do evento
    };
  }, []);

  return (
    <Box sx={{ width: "100%", maxWidth: 600, margin: "auto", overflow: "hidden" }}>
      <FormGroup sx={{ flexDirection: "row", justifyContent: "flex-start", flexWrap: "wrap" }}>
        {patientFoodLog.map((s) => (
          <FormControlLabel
            key={s.label}
            control={
              <Checkbox
                checked={selectedSeries.includes(s.label)}
                onChange={() => handleCheckboxChange(s.label)}
              />
            }
            label={s.label}
          />
        ))}
      </FormGroup>

      {/* Container com altura e largura máximas definidas */}
      <Box sx={{ width: "100%", height: "300px", maxWidth: "500px", margin: "auto", overflow: "hidden" }}>
        <Doughnut
          ref={chartRef} // Adiciona a ref ao gráfico
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "top" as const,
              },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`,
                },
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
