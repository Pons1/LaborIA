import joblib
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def generar_grafico():
    print("Cargando el cerebro de la IA...")
    # 1. Cargamos el modelo y las columnas que guardaste en tu entrenamiento local
    modelo = joblib.load('orientador_ia.pkl')
    columnas = joblib.load('columnas_orientador.pkl')

    # 2. Extraemos el peso/importancia matemática de cada variable
    importancias = modelo.feature_importances_

    # 3. Lo metemos en un DataFrame para organizarlo
    df_importancia = pd.DataFrame({
        'Variable': columnas,
        'Importancia': importancias
    })

    # 4. Ordenamos de mayor a menor y nos quedamos con el Top 10
    df_top10 = df_importancia.sort_values(by='Importancia', ascending=False).head(10)

    # 5. Dibujamos el gráfico con un estilo limpio y académico
    plt.figure(figsize=(10, 6))
    sns.set_theme(style="whitegrid")

    ax = sns.barplot(x='Importancia', y='Variable', data=df_top10, palette='mako')

    plt.title('Top 10 Variables más influyentes en la Predicción', fontsize=14, pad=15, fontweight='bold')
    plt.xlabel('Nivel de Importancia (Contribución al Modelo)', fontsize=12)
    plt.ylabel('Atributo Sociodemográfico', fontsize=12)

    plt.tight_layout()

    # 6. Guardamos el gráfico como imagen PNG de alta resolución
    plt.savefig('importancia_variables.png', dpi=300)
    print("✅ ¡Gráfico exportado con éxito como 'importancia_variables.png'!")

if __name__ == "__main__":
    generar_grafico()