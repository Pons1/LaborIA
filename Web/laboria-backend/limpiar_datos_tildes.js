const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function limpiarBaseDeDatos() {
    try {
        await client.connect();
        console.log("🟢 Conectado a MongoDB. Iniciando limpieza avanzada de tildes...");
        
        const db = client.db('labor_ia');
        const collection = db.collection('contratos');

        console.log("⏳ Procesando registros. Esto puede tardar unos minutos...");

        // Función auxiliar que anida múltiples $replaceAll para quitar todas las tildes
        // Primero aseguramos que todo está en mayúsculas y sin espacios extra
        const quitarTildes = (campo) => {
            let textoLimpio = { $trim: { input: { $toUpper: campo } } };
            
            // Reemplazos de vocales acentuadas
            const reemplazos = [
                { busca: "Á", pone: "A" },
                { busca: "É", pone: "E" },
                { busca: "Í", pone: "I" },
                { busca: "Ó", pone: "O" },
                { busca: "Ú", pone: "U" },
                { busca: "Ä", pone: "A" },
                { busca: "Ë", pone: "E" },
                { busca: "Ï", pone: "I" },
                { busca: "Ö", pone: "O" },
                { busca: "Ü", pone: "U" }
            ];

            reemplazos.forEach(r => {
                textoLimpio = { 
                    $replaceAll: { input: textoLimpio, find: r.busca, replacement: r.pone } 
                };
            });

            return textoLimpio;
        };

        // Ejecutamos la actualización masiva
        const resultado = await collection.updateMany(
            {}, 
            [
                {
                    $set: {
                        DESC_SECTOR: quitarTildes("$DESC_SECTOR"),
                        DESC_GENERO: quitarTildes("$DESC_GENERO"),
                        NOM_MUN:     quitarTildes("$NOM_MUN")
                    }
                }
            ]
        );

        console.log(`✅ ¡Limpieza avanzada completada con éxito!`);
        console.log(`📊 Documentos actualizados/normalizados: ${resultado.modifiedCount}`);

    } catch (error) {
        console.error("🔴 Error durante la limpieza:", error);
    } finally {
        await client.close();
        process.exit(0);
    }
}

limpiarBaseDeDatos();