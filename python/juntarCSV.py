import pandas as pd
import glob
import os

path = './DATOS' 
all_files = glob.glob(os.path.join(path, "*.csv"))

li = []

for filename in all_files:
    # Leemos con el separador correspondiente
    df = pd.read_csv(filename, index_col=None, header=0, sep=';')
    
    # --- CORRECCIÓN DE COLUMNAS ---
    # Renombramos 'ANYO' a 'AÑO' si existe en este archivo específico
    df.rename(columns={'ANYO': 'AÑO'}, inplace=True)
    
    # Opcional: eliminar espacios en blanco adicionales en los nombres por si acaso
    df.columns = df.columns.str.strip()
    
    li.append(df)

# Ahora la concatenación será perfecta porque las columnas coinciden
df_total = pd.concat(li, axis=0, ignore_index=True)

# Verificación final
print(f"Dimensiones tras la corrección: {df_total.shape}")
print("Columnas actuales:", df_total.columns.tolist())
# Muestra las 10 primeras filas del DataFrame unificado
print(df_total.head(10))

print("\nConteo por cada grupo:")
print(df_total['DESC_GRUPO'].value_counts())

# Definir el nombre del archivo de salida
output_file = 'Contratacion_Valencia_Limpio.csv'

# Guardar el DataFrame en un nuevo CSV
df_total.to_csv(output_file, index=False, sep=';', encoding='utf-8-sig')

print(f"✅ ¡Éxito! El archivo se ha guardado como: {output_file}")