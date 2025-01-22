import { PatientInfoProps } from "../types/patient";


export const getPatientById = async (id: string) => {
    const serverIp = process.env.NEXT_PUBLIC_IP_SERVER;
    const port = process.env.NEXT_PUBLIC_PORT;
    const pid = Number(id);
    console.log(id)
    try {
      const response = await fetch(`http://${serverIp}/get_patient.php?id=${pid}`);
      
      if (!response.ok) {
        throw new Error("Erro ao fetch de paciente.");
      }
  
      const data = await response.json();
  
      const patient: PatientInfoProps = data.map((patient: PatientInfoProps) => ({
        id_patient: patient.id_patient,
        name: patient.name ? patient.name : `0${patient.id_patient}`,
        age: patient.age ? patient.age : "N/A",
        gender: patient.gender,
      }));
  
      return patient;
    } catch (error) {
      console.log("Erro ao tentar obter dados do paciente:", error);
      return null;
    }
}