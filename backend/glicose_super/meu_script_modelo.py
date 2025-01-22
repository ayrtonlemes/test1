import tensorflow as tf
import pandas as pd

x_test_path = "C:\\xampp\\htdocs\\glicose_super\\entrada1.csv"
model_path = "C:\\xampp\\htdocs\\glicose_super\\mlp_model_ecg_standard_seed9.keras"
output_path = "C:\\xampp\\htdocs\\glicose_super\\predicao1.csv"

x_test = pd.read_csv(x_test_path)

model = tf.keras.models.load_model(model_path)

predictions = model.predict(x_test)

output_df = pd.DataFrame(predictions, columns=['Prediction'])
output_df.to_csv(output_path, index=False)

print(f"Previsões salvas em {output_path}")