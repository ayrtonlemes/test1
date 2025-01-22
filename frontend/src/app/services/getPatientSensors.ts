
export const getPatientSensors = async (id: number, sensorType: string, dateTime: string) => {

    const serverIp = process.env.NEXT_PUBLIC_IP_SERVER;
    const port = process.env.NEXT_PUBLIC_PORT;
    //const pid = Number(id);

    try {
        const response = await fetch(`http://${serverIp}/get_patient_sensors.php?id=${id}&sensor=${sensorType.toLowerCase()}&datetime=${dateTime}`);

        if (!response.ok) {
          throw new Error("Erro ao fetch dos sensores do paciente.");
        }
    
        const data = await response.json();
    
//        if (!Array.isArray(data)) {
  //        throw new Error("Formato de dados inesperado.");
    //    }
        
        return data;
      } catch (error) {
        console.log("Erro ao tentar obter  o sensor do paciente:", error);
        return [];
      }
}