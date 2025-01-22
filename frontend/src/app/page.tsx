'use client'

import React, { useCallback, useEffect, useState } from "react";
import { Box, Typography, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Paper, Backdrop, CircularProgress } from "@mui/material";
import { sensorConfigs } from "@/app/types/sensors";
import { getAllPatients } from "./services/getPatients";
import { getDatetime } from "./services/getDatetime";
import LineGraph from "@/app/components/LineGraph";
import CaloriesGraphBar from "@/app/components/CaloriesGraph";
import PredictBox from "./components/PredictBox";
import { getPatientSensors } from "./services/getPatientSensors";

interface PatientDataProps {
  id_patient: number;
  name: string;
  age: number | string;
  gender: string;
}

export default function Home() {
  const [patientData, setPatientData] = useState<PatientDataProps | null>(null);
  const [patients, setPatients] = useState<PatientDataProps[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<string | undefined>('');
  const [selectedPatient, setSelectedPatient] = useState<string | undefined>('');
  const [selectedDate, setSelectedDate] = useState<string | undefined>('');
  const [datetimeRange, setDatetimeRange] = useState<string[]>([]);
  const [minNav, setMinNav] = useState<number>(0);
  const [maxNav, setMaxNav] = useState<number>(20);
  const [sensorData, setSensorData] = useState<number[]>([]);
  const allSensors = sensorConfigs;

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllPatients();
      setPatients(data);
    } catch (err) {
      setError("Erro ao carregar pacientes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);


  const fetchDatetimeRange = useCallback(async (id_patient: number, min: number, limit: number) => {
    try {
      setLoading(true);
      const data = await getDatetime(id_patient, min, limit);
      if (data && data.length > 0) {
        const formattedDates = data.map((item: { datetime: string }) => item.datetime);
        setDatetimeRange(formattedDates);
        console.log("Atualizado datetimeRange:", formattedDates);
      } else {
        setDatetimeRange([]);
      }
    } catch (err) {
      setError("Erro ao carregar datetimes do paciente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSensorsData = useCallback(async (id_patient: number, selectedSensor: string, dateTime: string) => {
    try {
      setLoading(true);
      const data = await getPatientSensors(id_patient, selectedSensor, dateTime)
      console.log(data);
      if(data && data.length > 0) {
        setSensorData(data);
      }
    }catch(err) {
      setError("Erro ao obter dados do sensor do paciente");
      console.log(err);
    }finally {
      setLoading(false);
    }
  }, [])

  const handleDatetimeChange = (direction: 'next' | 'prev') => {
    const step = 20;
    const newMin = direction === 'next' ? minNav + step : Math.max(0, minNav - step);
    setMinNav(newMin);
    fetchDatetimeRange(patientData?.id_patient ?? 0, newMin, step);
  };

  const handlePatientChange = (event: SelectChangeEvent) => {
    const selectedName = event.target.value as string;
    setSelectedPatient(selectedName);
    const patient = patients?.find((p) => p.name === selectedName);
    if (patient) {
      setPatientData(patient);
      setMinNav(0); // Reseta o intervalo para o início
      fetchDatetimeRange(patient.id_patient, 0, maxNav); // Carrega as datas iniciais
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    if(selectedPatient && selectedSensor && selectedDate) {
      const patient = patients?.find(p => p.name === selectedPatient);
      if(patient) {
        setSensorData([]);
        fetchSensorsData(patient.id_patient, selectedSensor, selectedDate);
      }
    }
  }, [selectedPatient, selectedSensor, selectedDate, fetchSensorsData]);
  //if (loading) return <Typography>Carregando dados...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (


    <Box padding={3}>
      <FormControl sx={{ m: 1, minWidth: 300 }}>
        <InputLabel id="patient-selector-label">Selecione um paciente</InputLabel>
        <Select
          labelId="patient-selector-label"
          value={selectedPatient ?? ''}
          onChange={handlePatientChange}
        >
          {patients
            ? patients.map((patient) => (
                <MenuItem key={patient.id_patient} value={patient.name}>
                  {patient.name}
                </MenuItem>
              ))
            : (
                <MenuItem value="" disabled>
                  Não há pacientes cadastrados.
                </MenuItem>
              )}
        </Select>
      </FormControl>

      {datetimeRange.length > 0 && (
        <Box marginBottom={4}>
          <Typography variant="h6">Selecione um horário:</Typography>
          <Box display="flex" gap={2} overflow="auto">
            {datetimeRange.map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                style={{
                  padding: "10px 15px",
                  borderRadius: "5px",
                  backgroundColor: selectedDate === date ? "#1976d2" : "#f0f0f0",
                  color: selectedDate === date ? "#fff" : "#000",
                  cursor: "pointer",
                }}
              >
                {new Date(date).toLocaleString()}
              </button>
            ))}
          </Box>
        </Box>
      )}

      <Box display="flex" justifyContent="space-between">
        <button onClick={() => handleDatetimeChange('prev')} disabled={minNav === 0}>
          Anterior
        </button>
        <button onClick={() => handleDatetimeChange('next')}>
          Próximo
        </button>
      </Box>

      {/* Sensores e gráficos */}
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
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="sensor-select-label">Escolha o sensor</InputLabel>
            <Select
              labelId="sensor-select-label"
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value as string)}
            >
              {Object.keys(allSensors).map((key) => (
                <MenuItem key={key} value={key}>
                  {allSensors[key].typeSensor}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedSensor && patientData && (
            <LineGraph
              selectedSensor={sensorConfigs[selectedSensor]}
              data={sensorData}
            />
          )}
        </Box>

        <Box flex={1} component={Paper} padding="2px">
          <Typography variant="h6" gutterBottom>
            Registro Alimentar
          </Typography>
          <CaloriesGraphBar />
        </Box>
      </Box>

      <Box flex={1} component={Paper} margin="2px" padding="4px" sx={{textAlign: 'left'}}>
        <PredictBox loading={loading} setLoading={setLoading}/>
      </Box>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={loading} // Exibe o Backdrop quando 'loading' for true
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
