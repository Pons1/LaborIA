const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function normalizarProvincias() {
    try {
        await client.connect();
        console.log("🟢 Conectado a MongoDB. Iniciando limpieza de provincias...");
        
        const db = client.db('labor_ia');
        const collection = db.collection('contratos');

        // 1. Unificar ALICANTE
        const resAlicante = await collection.updateMany(
            { NOM_PROV: { $in: ["Alicante/Alacant", "ALICANTE"] } },
            { $set: { NOM_PROV: "ALICANTE" } }
        );
        console.log(`🔹 Registros de Alicante corregidos: ${resAlicante.modifiedCount}`);

        // 2. Unificar CASTELLÓN (quitamos la tilde también para estandarizar)
        const resCastellon = await collection.updateMany(
            { NOM_PROV: { $in: ["Castellón/Castelló", "CASTELLÓN", "CASTELLON"] } },
            { $set: { NOM_PROV: "CASTELLON" } }
        );
        console.log(`🔹 Registros de Castellón corregidos: ${resCastellon.modifiedCount}`);

        // 3. Unificar VALENCIA
        const resValencia = await collection.updateMany(
            { NOM_PROV: { $in: ["Valencia/València", "VALENCIA"] } },
            { $set: { NOM_PROV: "VALENCIA" } }
        );
        console.log(`🔹 Registros de Valencia corregidos: ${resValencia.modifiedCount}`);

        console.log(`\n✅ ¡Provincias normalizadas con éxito!`);

    } catch (error) {
        console.error("🔴 Error durante la limpieza:", error);
    } finally {
        await client.close();
        process.exit(0);
    }
}

normalizarProvincias();