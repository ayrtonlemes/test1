import React, { useState, useEffect } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { getResultModel } from '../services/getResultModel';

interface PredictBoxProps {
  loading: boolean;
  setLoading: (loading: boolean) => void
}

export default function PredictBox({ loading, setLoading }: PredictBoxProps) {
  const [result, setResult] = useState<string | number | null>(null);
  const [glicoResult, setGlicoResult] = useState<string>('Aguardando...');

  const classifyGlico = (value: string | number) => {
    const numericValue = parseFloat(value as string).toFixed(3);
    console.log("value:", numericValue);

    if (parseFloat(numericValue) <= 70) {
      setGlicoResult("Hipoglicemia");
    } else if (parseFloat(numericValue) <= 99) {
      setGlicoResult("Normal");
    } else if (parseFloat(numericValue) <= 125) {
      setGlicoResult("Pré-diabetes");
    } else {
      setGlicoResult("Diabetes");
    }

    setLoading(false);
  };

  const fetchResultData = async () => {
    try {
      setLoading(true);
      const response = await getResultModel(); // Buscar os dados
      if (response) {
        const value = response[1];
        setResult(value); // Atualizar o valor de result
        classifyGlico(value); // Classificar imediatamente
      } else {
        setResult("Nenhum dado encontrado");
        setGlicoResult("Valor inválido");
      }
    } catch (error) {
      console.error("Erro ao obter os dados:", error);
      setResult("Erro ao obter os dados");
      setGlicoResult("Valor inválido");
    }finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Seção da esquerda */}
        <Box
          sx={{
            flex: 1,
            paddingRight: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start', // Alinha os textos à esquerda
            textAlign: 'left',        // Garante alinhamento de texto
          }}
        >
          <Typography>
            Hipoglicemia: Menor que 70 mg/dL.
          </Typography>
          <Typography>
            Normal: Entre 70 mg/dL e 99 mg/dL.
          </Typography>
          <Typography>
            Pré-diabetes: Entre 100 mg/dL e 125 mg/dL (também chamado de glicemia de jejum alterada).
          </Typography>
          <Typography>
            Diabetes: Igual ou superior a 126 mg/dL em mais de uma medição.
          </Typography>
        </Box>

        {/* Divisor cinza */}
        <Box sx={{ width: '1px', height: '100%', backgroundColor: 'gray', marginX: 2 }} />

        {/* Seção da direita */}
        <Box
          sx={{
            flex: 1,
            paddingLeft: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start', // Alinha textos à esquerda
            textAlign: 'left',        // Garante alinhamento de texto
          }}
        >
          <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 2 }}>
            <Typography variant="h5" gutterBottom>
              Resultado:
            </Typography>
            <Button variant="outlined" onClick={fetchResultData}>Predict glicose</Button>
          </Stack>
          {/* Exibe a mensagem baseada no resultado */}
          <Typography>
            {result && !isNaN(Number(result))
              ? `O nível de glicemia de ${parseFloat(result as string).toFixed(3)} mg/dL foi classificado como: ${glicoResult}`
              : "Aguardando previsão..."}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
