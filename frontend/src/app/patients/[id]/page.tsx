'use client'
import React, { useEffect, useState } from "react";

import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { getPatientById} from "../../services/getPatientById";
import { usePathname } from "next/navigation";
import CaloriesGraphBar from "@/app/components/CaloriesGraph";
import LineGraph from "@/app/components/LineGraph";
import { PatientInfoProps } from "@/app/types/patient";
import { sensorConfigs } from "@/app/types/sensors";

interface PatientDataProps {
  id: number;
  name: string;
  age: number | string;
  gender: string
}


const PatientDetails = () => {
  const [patientData, setPatientData] = useState<PatientInfoProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<string | undefined>('');
  
  const allSensors = sensorConfigs;
  
  const pathname = usePathname();

  const handleSensorChange = (event: SelectChangeEvent) => {
    setSelectedSensor(event.target.value as string);
  }

  const id = pathname ? pathname.split("/").filter(Boolean).pop() : null;
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        if(id) {
            const data = await getPatientById(id);
            console.log(data)
            setPatientData(data);
            console.log(patientData)
        }
        else {
            setError("PacienteNaoEncontrado")
        }
      } catch (err) {
        setError("Erro ao carregar dados do paciente.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  useEffect(() => {
    if (patientData) {
      console.log("Dados atualizados do paciente:", patientData);
    }
  }, [patientData]);
  if (loading) return <Typography>Carregando dados...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box padding={3}>
      <Typography variant="h4" gutterBottom>
        Detalhes do Paciente
      </Typography>

      {patientData && (
        <Box marginBottom={4}>
          <Typography variant="h6">Informações do Paciente:</Typography>
          <Typography>ID: {patientData.id_patient}</Typography>
          <Typography>Gênero: {patientData.gender}</Typography>
        </Box>
      )}

    <Box
      display="flex"
      flexDirection={{ xs: 'column', md: 'row' }}
      gap={2}
      justifyContent="space-between"
      alignItems="stretch"
    >
      <Box flex={1} component={Paper} padding="2px">
        <Typography variant="h6" gutterBottom>
          Dados de sensores cardíacos
        </Typography>
        <Box>
          <FormControl sx ={{m: 1, minWidth: 120}}>
            <InputLabel id="sensor-select-label">Escolha o sensor</InputLabel>
            <Select 
              labelId="sensor-select-label"
              value={selectedSensor}
              onChange={handleSensorChange}
              label="Escolha um sensor"
            >
            {Object.keys(allSensors).map((key) => (
              <MenuItem key={key} value={key}>
                {allSensors[key].typeSensor}
              </MenuItem>
            ))}
            </Select>
          </FormControl>

          <Typography> Dia</Typography>
        </Box>

        {selectedSensor && (

          <LineGraph 
          selectedSensor={sensorConfigs[selectedSensor]} 
          selectedPatient={id!}>

          </LineGraph>
        )}
      </Box>

      <Box flex={1} component={Paper} padding="2px">

        <Typography variant="h6" gutterBottom>
          Registro Alimentar
        </Typography>
        <Box sx={{padding:"2px"}}>
        <CaloriesGraphBar>
          
        </CaloriesGraphBar>

        </Box>
      

      </Box>
    </Box>
  </Box>
  );
};

export default PatientDetails;
