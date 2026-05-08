from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app)

print("⏳ Cargando Orientador IA en memoria...")
modelo = joblib.load('orientador_ia.pkl')
columnas_entrenamiento = joblib.load('columnas_orientador.pkl')
print("✅ Orientador IA listo en el puerto 5000.")

@app.route('/predecir', methods=['POST'])
def orientar_usuario():
    try:
        datos = request.json
        mes_actual = int(datos.get('mes', 8)) # Mes futuro simulado (ej. Agosto)
        sector = datos.get('sector').upper()
        genero = datos.get('genero').upper()
        edad = datos.get('edad')

        provincias = ['ALICANTE', 'CASTELLON', 'VALENCIA']
        predicciones = []

        # 1. La IA evalúa las 3 provincias para este perfil exacto
        for prov in provincias:
            df_pred = pd.DataFrame(0, index=[0], columns=columnas_entrenamiento)
            df_pred.loc[0, 'MES'] = mes_actual
            
            # Marcamos las características del usuario (si existen en el entrenamiento)
            for col, val in [('PROVINCIA', prov), ('SECTOR', sector), ('GENERO', genero), ('EDAD', edad)]:
                nombre_columna = f"{col}_{val}"
                if nombre_columna in df_pred.columns:
                    df_pred.loc[0, nombre_columna] = 1
                    
            contratos_esperados = modelo.predict(df_pred)[0]
            predicciones.append({"provincia": prov, "contratos": int(contratos_esperados)})

        # 2. Elegimos la provincia ganadora (la que tiene más demanda)
        mejor_provincia = max(predicciones, key=lambda x: x['contratos'])

        # 3. BIG DATA: Buscamos el municipio exacto más favorable históricamente
        client = MongoClient('mongodb://localhost:27017/')
        db = client['labor_ia']
        collection = db['contratos']
        
        mejor_municipio = collection.aggregate([
            { "$match": { 
                "NOM_PROV": mejor_provincia['provincia'], 
                "DESC_SECTOR": sector, 
                "DESC_GENERO": genero,
                "RANGO_EDAD": edad
            }},
            { "$group": { "_id": "$NOM_MUN", "total": { "$sum": { "$toInt": "$NUM_CONTRATOS" } } } },
            { "$sort": { "total": -1 } },
            { "$limit": 1 }
        ]).to_list(1)
        
        client.close()

        municipio_recomendado = mejor_municipio[0]['_id'] if mejor_municipio else "la capital"

        mensaje = (f"📍 TU LUGAR IDEAL: La provincia de {mejor_provincia['provincia']} "
                   f"es donde tienes más opciones. Destaca especialmente el municipio de {municipio_recomendado}.")

        return jsonify({
            "status": "success",
            "provincia": mejor_provincia['provincia'],
            "municipio": municipio_recomendado,
            "mensaje": mensaje
        })

    except Exception as e:
        return jsonify({"status": "error", "mensaje": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)