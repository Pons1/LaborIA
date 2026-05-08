import pandas as pd
from pymongo import MongoClient
from sklearn.ensemble import RandomForestRegressor
import joblib

def entrenar_orientador():
    print("📥 1. Extrayendo perfiles sociolaborales y ubicaciones de MongoDB...")
    client = MongoClient('mongodb://localhost:27017/')
    db = client['labor_ia']
    collection = db['contratos']

    # Agrupamos los datos ignorando el año para sacar la "estacionalidad pura" del perfil
    pipeline = [
        { 
            "$group": { 
                "_id": { 
                    "MES": { "$toInt": "$MES" }, 
                    "PROVINCIA": "$NOM_PROV",
                    "SECTOR": "$DESC_SECTOR",
                    "GENERO": "$DESC_GENERO",
                    "EDAD": "$RANGO_EDAD"
                }, 
                "TOTAL": { "$sum": { "$toInt": "$NUM_CONTRATOS" } } 
            } 
        }
    ]
    
    resultados = list(collection.aggregate(pipeline))
    client.close()

    # Aplanamos los datos
    datos = []
    for doc in resultados:
        if doc['_id'].get('PROVINCIA') and doc['_id'].get('SECTOR'):
            datos.append({
                'MES': doc['_id']['MES'],
                'PROVINCIA': doc['_id']['PROVINCIA'],
                'SECTOR': doc['_id']['SECTOR'],
                'GENERO': doc['_id']['GENERO'],
                'EDAD': doc['_id']['EDAD'],
                'CONTRATOS': doc['TOTAL']
            })
            
    df = pd.DataFrame(datos)
    print(f"✅ Se han consolidado {len(df)} patrones de empleabilidad.")

    # 2. Preprocesamiento (One-Hot Encoding para las variables de texto)
    df_encoded = pd.get_dummies(df, columns=['PROVINCIA', 'SECTOR', 'GENERO', 'EDAD'])

    X = df_encoded.drop('CONTRATOS', axis=1)
    y = df_encoded['CONTRATOS']

    print("🚀 3. Entrenando IA de Orientación Laboral...")
    modelo = RandomForestRegressor(n_estimators=100, random_state=42)
    modelo.fit(X, y)

    # 4. Guardamos el modelo
    print("💾 4. Guardando el cerebro del orientador...")
    joblib.dump(modelo, 'orientador_ia.pkl')
    joblib.dump(X.columns, 'columnas_orientador.pkl')
    print("🎯 ¡Modelo listo para asesorar usuarios!")

if __name__ == "__main__":
    entrenar_orientador()