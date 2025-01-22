import { PatientInfoProps } from "../types/patient";


export const getAllPatients = async (): Promise<PatientInfoProps[]> => {
  const serverIp = process.env.NEXT_PUBLIC_IP_SERVER;
  const port = process.env.NEXT_PUBLIC_PORT;
  try {
    const response = await fetch(`http://${serverIp}/get_patient_list.php`);
    if (!response.ok) {
      throw new Error("Erro ao fetch de todos os pacientes.");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Formato de dados inesperado.");
    }

    const patients: PatientInfoProps[] = data.map((patient: PatientInfoProps) => ({
      id_patient: patient.id_patient,
      name: patient.name ? patient.name : `Patient 0${patient.id_patient}`,
      age: patient.age ? patient.age : "N/A",
      gender: patient.gender,
    }));

    return patients;
  } catch (error) {
    console.log("Erro ao tentar obter todos os pacientes:", error);
    return [];
  }
};


