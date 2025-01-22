import { Box, Container, Typography } from "@mui/material";
import { PatientInfoProps } from "../types/patient";

interface PatientInfoComponentProps {
  selectedPatient: PatientInfoProps | null;
}

const PatientInfo: React.FC<PatientInfoComponentProps> = ({ selectedPatient }) => {
  if (!selectedPatient) {
    return <Container>
      <Box>
        <Typography>Selecione um paciente para continuar.</Typography>
      </Box>
    </Container>
  }

  return (
    <Container>
      <Box>
        <Typography variant="h3">Informações do paciente:</Typography>
        <p>Nome: {selectedPatient.name}</p>
        <p>Idade: {selectedPatient.age}</p>
        <p>Gênero: {selectedPatient.gender}</p>
      </Box>
    </Container>
  );
};

export default PatientInfo;
