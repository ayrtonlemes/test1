

interface FoodDataProps {
    id_sec_data: number;
    id_patient : number;
    registro_date: string;
    registro_time: string;
    time_begin: string;
    time_end: string;
    logged_food: string;
    calorie: number;
    carbo: number;
    sugar: number;
    protein: number;
}

export const getFoodData = async (idPatient: string) =>  {
    const serverIp = process.env.NEXT_PUBLIC_IP_SERVER;
    const pid = Number(idPatient);

    try {
        const response = await fetch(`http://${serverIp}list_food_data.php?id=${pid}`)
    
        if(!response.ok) {
            throw new Error("Erro ao obter dados de comida"); 
        }

        const foodData = await response.json();

        if (!Array.isArray(foodData)) {
            throw new Error("Formato inesperado da resposta da API.");
          }

        return foodData;
    } catch(error) {
        console.log("Erro ao tentar obter os dados de comida: ", error);
        return [];
    }
}