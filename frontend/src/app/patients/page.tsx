'use client'

import { useEffect, useState } from "react";
import { getAllPatients } from "../services/getPatients";
import {
  Container,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import Link from "next/link";

interface PatientsProps {
  id_patient: number;
  name: string;
  age: number | string;
  gender: string;
}

export default function Patients() {
  const [listPatients, setListPatients] = useState<PatientsProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patients = await getAllPatients();
        setListPatients(patients);
      } catch (error) {
        console.error("Erro ao buscar os pacientes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Lista de Pacientes
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : listPatients.length > 0 ? (
        <List>
          {listPatients.map((patient) => (
            <ListItem
              key={patient.id_patient}
              sx={{
                borderBottom: "1px solid #e0e0e0",
                "&:hover": { backgroundColor: "#f9f9f9" },
              }}
            >
              <Link
                href={`/patients/${patient.id_patient}`}
                passHref
                style={{ textDecoration: "none", width: "100%" }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="h6"
                      component="span"
                      sx={{ color: "primary.main", cursor: "pointer" }}
                    >
                      {patient.name}
                    </Typography>
                  }
                  secondary={`${patient.age} anos, ${patient.gender}`}
                />
              </Link>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1" align="center" color="textSecondary">
          Nenhum paciente encontrado.
        </Typography>
      )}
    </Container>
  );
}
