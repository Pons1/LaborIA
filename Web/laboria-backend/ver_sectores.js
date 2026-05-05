const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function verValoresUnicos() {
    try {
        await client.connect();
        const db = client.db('labor_ia');
        const collection = db.collection('contratos');

        // Estos son los campos de texto según la estructura de tu base de datos
        const camposDeTexto = [
            'NOM_PROV',
            'NOM_MUN',
            'COD_SECTOR',
            'DESC_SECTOR',
            'DESC_GRUPO',
            'COD_GENERO',
            'DESC_GENERO',
            'RANGO_EDAD'
        ];

        console.log("🔍 ESCANEANDO VALORES ÚNICOS EN CAMPOS DE TEXTO...\n");

        for (let campo of camposDeTexto) {
            // distinct() saca una lista sin repeticiones
            const valores = await collection.distinct(campo);
            
            console.log(`==========================================`);
            console.log(`📊 COLUMNA: ${campo}`);
            console.log(`Total de valores distintos: ${valores.length}`);
            console.log(`------------------------------------------`);
            
            // Si hay más de 20 valores únicos, mostramos solo una muestra para no romper la consola
            if (valores.length > 20) {
                console.log(valores.slice(0, 10).join(', ') + ` ... [y ${valores.length - 10} valores más]`);
            } else {
                // Si son poquitos, los mostramos todos
                console.log(valores.join('  |  '));
            }
            console.log(`==========================================\n`);
        }

    } catch (error) {
        console.error("🔴 Error al escanear:", error);
    } finally {
        await client.close();
    }
}

verValoresUnicos();