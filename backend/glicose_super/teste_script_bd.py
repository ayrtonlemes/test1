import time
import mysql.connector
import pandas as pd
import numpy as np
from scipy import signal
from scipy.interpolate import interp1d
from datetime import timedelta
from numpy import trapz
import os
from tensorflow.keras.models import load_model  # Para carregar o modelo

# Função para recuperar dados de uma tabela por intervalo de tempo
def get_data_batch(table_name, cursor, id_patient):
    query = f"""
        SELECT * FROM {table_name}
        WHERE id_patient = %s
    """
    try:
        cursor.execute(query, (id_patient,))
        result = cursor.fetchall()
        if result:
            columns = [desc[0] for desc in cursor.description]
            return pd.DataFrame(result, columns=columns)
        else:
            return pd.DataFrame()
    except mysql.connector.Error as err:
        print(f"Erro ao recuperar dados da tabela {table_name}: {err}")
        return pd.DataFrame()

# Configuração do banco de dados
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'glicose'
}

try:
    # Conexão com o banco
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor()

    # Recuperando dados das tabelas
    id_patient = 1  # Substituir pelo ID correto do paciente
    glicodex_data = get_data_batch('glicodex_data', cursor, id_patient)
    ibi_data = get_data_batch('ibi_data', cursor, id_patient)
    acc_data = get_data_batch('acc_data', cursor, id_patient)
    eda_data = get_data_batch('eda_data', cursor, id_patient)
    hr_data = get_data_batch('hr_data', cursor, id_patient)

    if glicodex_data.empty or ibi_data.empty:
        print("Os dados de glicose ou IBI estão ausentes.")
    else:
        glicodex_data['datetime'] = pd.to_datetime(glicodex_data['datetime'])
        ibi_data['datetime'] = pd.to_datetime(ibi_data['datetime'])
        hr_data['datetime'] = pd.to_datetime(hr_data['datetime'])

        results = []

        # Carregar o modelo treinado
        model = load_model(r'C:\Users\aline\OneDrive\Documentos\Super\Códigos Corretos\Modelo\mlp_model_ecg_standard_seed9.keras')  # Substitua pelo caminho correto do seu modelo

        for _, row in glicodex_data.iterrows():
            glicose_time = row['datetime']
            start_time = glicose_time - timedelta(minutes=5)

            ibi_subset = ibi_data[(ibi_data['datetime'] >= start_time) & (ibi_data['datetime'] <= glicose_time)]
            hr_subset = hr_data[(hr_data['datetime'] >= start_time) & (hr_data['datetime'] <= glicose_time)]

            if len(ibi_subset) > 0:
                rr_intervals = ibi_subset['ibi'].values * 1000  # Converter de segundos para milissegundos
                if len(rr_intervals) >= 226:  # Critério mínimo de duração

                    # Cálculo de métricas
                    sdnn = np.std(rr_intervals)
                    rmssd = np.sqrt(np.mean(np.square(np.diff(rr_intervals))))
                    nn50 = np.sum(np.abs(np.diff(rr_intervals)) > 50)
                    pnn50 = (nn50 / len(rr_intervals)) * 100

                    # Calcular SDANN e ASDNN (24 horas)
                    # Agrupando as métricas por 24h (1440 minutos)
                    ibi_data_24h = ibi_data[(ibi_data['datetime'] >= glicose_time - timedelta(hours=24)) & (ibi_data['datetime'] <= glicose_time)]
                    rr_intervals_24h = ibi_data_24h['ibi'].values * 1000  # Converter de segundos para milissegundos

                    if len(rr_intervals_24h) > 0:
                        # SDANN: Desvio padrão das médias de RR intervalos por 5 minutos
                        sdann_values = []
                        for i in range(0, len(rr_intervals_24h), 300):  # Janelas de 300 segundos (5 minutos)
                            window = rr_intervals_24h[i:i + 300]
                            if len(window) > 0:
                                sdann_values.append(np.mean(window))
                        sdann = np.std(sdann_values)

                        # ASDNN: Desvio padrão das diferenças de RR intervalos
                        asdnn_values = []
                        for i in range(0, len(rr_intervals_24h), 300):  # Janelas de 300 segundos (5 minutos)
                            window = rr_intervals_24h[i:i + 300]
                            if len(window) > 0:
                                asdnn_values.append(np.std(np.diff(window)))
                        asdnn = np.mean(asdnn_values)

                    hr = hr_subset['hr'].values
                    hr_max = np.max(hr)
                    hr_min = np.min(hr)
                    hr_max_min = hr_max - hr_min

                    # Interpolação e análise de frequência
                    x = np.cumsum(rr_intervals) / 1000
                    f = interp1d(x, rr_intervals, kind='linear', fill_value="extrapolate")

                    fs = 4.0  # Frequência de amostragem
                    steps = 1 / fs
                    xx = np.arange(np.min(x), np.max(x), steps)
                    rr_interpolated = f(xx)

                    # Realizando a análise espectral
                    fxx, pxx = signal.welch(x=rr_interpolated, fs=fs, window='hann', nfft=4096)

                    cond_vlf = (fxx >= 0.003) & (fxx < 0.04)
                    cond_lf = (fxx >= 0.04) & (fxx < 0.15)
                    cond_hf = (fxx >= 0.15) & (fxx < 0.4)

                    vlf = trapz(pxx[cond_vlf], fxx[cond_vlf])
                    lf = trapz(pxx[cond_lf], fxx[cond_lf])
                    hf = trapz(pxx[cond_hf], fxx[cond_hf])

                    lf_peak = fxx[cond_lf][np.argmax(pxx[cond_lf])]
                    hf_peak = fxx[cond_hf][np.argmax(pxx[cond_hf])]

                    lf_hf_ratio = lf / hf
                    lf_hf_peak_ratio = lf_peak / hf_peak

                    # Organizando as métricas em um array
                    input_features = np.array([sdnn, nn50, pnn50, rmssd, hr_max_min, vlf, lf, hf, lf_hf_peak_ratio, lf_hf_ratio, sdann, asdnn])

                    # Fazendo a previsão usando o modelo
                    prediction = model.predict(input_features.reshape(1, -1))  # Ajustar para o formato correto

                    # Salvando os resultados
                    results.append({
                        'datetime': glicose_time,
                        'SDNN': sdnn,
                        'RMSSD': rmssd,
                        'NN50': nn50,
                        'PNN50': pnn50,
                        'HRmax - HRmin': hr_max_min,
                        'VLF Power': vlf,
                        'LF Power': lf,
                        'HF Power': hf,
                        'LFPeak/HFPeak': lf_hf_peak_ratio,
                        'LF/HF': lf_hf_ratio,
                        'SDANN 24h': sdann,   # Adicionando SDANN 24h
                        'ASDNN 24h': asdnn,   # Adicionando ASDNN 24h
                        'Prediction': prediction[0]  # Adicionando a previsão do modelo
                    })

        results_df = pd.DataFrame(results)
        print(results_df)

        # Filtrando apenas as colunas 'datetime' e 'Prediction'
        predictions_df = results_df[['datetime', 'Prediction']]

        # Configuração do caminho para salvar o CSV
        output_directory = "resultados"
        output_file = "resultados_com_previsao.csv"
        output_path = os.path.join(output_directory, output_file)

        # Criar o diretório, se não existir
        os.makedirs(output_directory, exist_ok=True)

        # Salvando apenas as previsões em um CSV
        if not predictions_df.empty:
            predictions_df.to_csv(output_path, index=False)
            print(f"Resultados com previsões salvos com sucesso em: {output_path}")
        else:
            print("Nenhum resultado para salvar.")


except mysql.connector.Error as err:
    print(f"Erro na conexão com o banco de dados: {err}")

finally:
    if connection.is_connected():
        cursor.close()
        connection.close()
