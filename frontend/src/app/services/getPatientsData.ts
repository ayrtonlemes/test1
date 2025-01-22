interface PatientProps {
    id: number;
    name: string;
    age: number;
    gender: string;
  }

export const getPatientsInfo = async (): Promise<PatientProps[]> => {
    try {
      const response = await fetch("http://localhost:5000/patients");
      if (!response.ok) {
        throw new Error("Erro ao fetch de todos os pacientes.");
      }
      const data = await response.json(); 
      
      const patientsInfo: PatientProps[] = data.patient;

      if (!Array.isArray(data.patient)) {
        throw new Error("Formato inesperado dos dados.");
      }
      
      return patientsInfo;
    
    } catch (error) {
      console.log("Erro ao tentar obter todos os pacientes:", error);
      return [];
    }
  };