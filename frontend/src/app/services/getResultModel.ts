


export const getResultModel  = async(idPatient?: string, datetime?: string ) => {

    const serverIp = process.env.NEXT_PUBLIC_IP_SERVER;
    const port = process.env.NEXT_PUBLIC_PORT;
    try {

        const response = await fetch(`http://${serverIp}/get_predict_model.php`);

        const data = await response.json();
        return data;
    }catch(error) {
        console.log("Erro ao obter o resultado do modelo", error)
    }
}