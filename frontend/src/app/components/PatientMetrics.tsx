// src/components/PatientMetrics.tsx
import { Box, Container, Typography } from "@mui/material";
import { PatientProps } from "../services/getPatients";

interface PatientMetricsComponentProps {
  selectedPatient: PatientProps | null;
}

const PatientMetrics: React.FC<PatientMetricsComponentProps> = ({ selectedPatient }) => {
  if (!selectedPatient) {
    return <div>Selecione um paciente para ver as métricas</div>;
  }

  return (
    <Container>
      <Box>
        <Typography variant="h3">Métricas do Paciente</Typography>
        <p>Frequência Cardíaca: {selectedPatient.metrics.heartRate}</p>
        <p>Pressão Arterial: {selectedPatient.metrics.bloodPressure}</p>
        <p>Saturação de Oxigênio: {selectedPatient.metrics.oxygenSaturation}</p>
      </Box>
    </Container>
  );
};

export default PatientMetrics;
