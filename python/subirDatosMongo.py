import pandas as pd
from pymongo import MongoClient

# 1. Cargar datos
df = pd.read_csv('DATOS/limpio/Contratacion_Valencia_Limpio.csv', sep=';', encoding='latin-1')

# 2. Conectar a MongoDB (Local o Atlas)
client = MongoClient('mongodb://localhost:27017/')
db = client['laboria_db']
collection = db['contratos']

# 3. Insertar datos
data_dict = df.to_dict(orient='records')
collection.insert_many(data_dict)
print(f"Éxito: {len(data_dict)} registros insertados.")
