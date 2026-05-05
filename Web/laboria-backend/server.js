const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors()); 

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function conectarDB() {
    try {
        await client.connect();
        console.log("🟢 Conexión estable con MongoDB");
    } catch (error) {
        console.error("🔴 Error inicializando MongoDB:", error);
    }
}
conectarDB();

app.get('/api/stats', async (req, res) => {
    try {
        const db = client.db('labor_ia');
        const collection = db.collection('contratos');

        // A. Totales
        const municipiosArray = await collection.distinct('NOM_MUN'); 
        const totalMunicipios = municipiosArray.length;

        const agregacionContratos = await collection.aggregate([
            { $group: { _id: null, total: { $sum: { $toInt: "$NUM_CONTRATOS" } } } }
        ]).toArray();
        const totalContratos = agregacionContratos.length > 0 ? agregacionContratos[0].total : 0;

        // B. Evolución Anual
        const contratosPorAno = await collection.aggregate([
            { $group: { _id: { $toInt: "$AÑO" }, total: { $sum: { $toInt: "$NUM_CONTRATOS" } } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        // C. Por Sector (Ordenado de mayor a menor)
        const porSector = await collection.aggregate([
            { $group: { _id: "$DESC_SECTOR", total: { $sum: { $toInt: "$NUM_CONTRATOS" } } } },
            { $sort: { total: -1 } }
        ]).toArray();

        // D. Por Género
        const porGenero = await collection.aggregate([
            { $group: { _id: "$DESC_GENERO", total: { $sum: { $toInt: "$NUM_CONTRATOS" } } } }
        ]).toArray();

        // E. Por Rango de Edad
        const porEdad = await collection.aggregate([
            { $group: { _id: "$RANGO_EDAD", total: { $sum: { $toInt: "$NUM_CONTRATOS" } } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        // Función auxiliar para separar labels y datos
        const formatearParaGrafica = (datos) => ({
            labels: datos.map(d => d._id || 'Desconocido'),
            datos: datos.map(d => d.total)
        });

        res.json({
            contratos: totalContratos,
            municipios: totalMunicipios,
            precision: 94, 
            graficaAnual: formatearParaGrafica(contratosPorAno),
            graficaSector: formatearParaGrafica(porSector),
            graficaGenero: formatearParaGrafica(porGenero),
            graficaEdad: formatearParaGrafica(porEdad)
        });

    } catch (error) {
        console.error("Error en la consulta:", error);
        res.status(500).json({ error: "Error procesando datos" });
    }
});

app.listen(3000, () => {
    console.log('✅ API de LaborIA corriendo en http://localhost:3000');
});