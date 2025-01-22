export interface PatientInfoProps {
    id_patient: number,
    name: string,
    age: number | string,
    gender: string,
}

export interface SensorsInfoProps {
    
}

export interface MedicalValuesProps {
    heartRate: string,
    bloodPressure: string,
    oxygenSaturation: string,
}


export interface HeartValueProps {
    id: number,
    idPatient: number,
    date: string[],
    time: string[],
    SDNN: number[],
    NN50: number[],
    PNN50: number[],
    RMSSD: number[],
    HRMax_Min: number[],
    HeartValuesF: HeartValueFreqProps,
}

interface HeartValueFreqProps {
    VLF_Power: number[],
    LF_Power: number[],
    HF_Power: number[],
    LF_HF_Peak:number[],
    LF_HF: number[]
}

export interface FoodLogProps {
    id: number,
    idPatient: number,
    date: string[],
    timeBegin: string[]
    timeEnd: string[],
    loggedFood: string[],
    calories: string[],
    carbo: string[],
    sugar: string[],
    protein: string[],
}

export interface SensorsProps{
    id: number,
    idPatient: number,
    date: string[],
    time: string[],
    eda: number[],
    glicoseDex: number[],
    skinTemperature: number[],
    HR: number[],
}

