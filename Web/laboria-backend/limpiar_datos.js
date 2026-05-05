const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function limpiarBaseDeDatos() {
    try {
        await client.connect();
        console.log("🟢 Conectado a MongoDB. Iniciando limpieza masiva...");
        
        const db = client.db('labor_ia');
        const collection = db.collection('contratos');

        console.log("⏳ Procesando millones de registros. Esto puede tardar unos minutos...");

        // Actualizamos TODOS los documentos unificando el formato
        const resultado = await collection.updateMany(
            {}, // Las llaves vacías significan que se aplicará a toda la colección
            [
                {
                    $set: {
                        // $toUpper pasa todo a mayúsculas. $trim quita espacios accidentales al inicio o final.
                        DESC_SECTOR: { $trim: { input: { $toUpper: "$DESC_SECTOR" } } },
                        DESC_GENERO: { $trim: { input: { $toUpper: "$DESC_GENERO" } } },
                        NOM_MUN:     { $trim: { input: { $toUpper: "$NOM_MUN" } } }
                    }
                }
            ]
        );

        console.log(`✅ ¡Limpieza completada con éxito!`);
        console.log(`📊 Documentos actualizados/normalizados: ${resultado.modifiedCount}`);

    } catch (error) {
        console.error("🔴 Error durante la limpieza:", error);
    } finally {
        await client.close();
        process.exit(0);
    }
}

limpiarBaseDeDatos();
