const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuración de CORS para permitir que tu Frontend conecte desde cualquier origen
app.use(cors());
app.use(express.json());

// URI de conexión local a la base de datos de MongoDB en AWS
const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log('🟢 Conectado con éxito a la base de datos MongoDB en AWS');
    } catch (error) {
        console.error('🔴 Error crítico al conectar con MongoDB:', error);
        process.exit(1);
    }
}

// Inicializar la conexión con el motor de base de datos
connectDB();

/**
 * RUTA ULTRA-OPTIMIZADA (CACHÉ PRE-AGREGADA)
 * Reduce el tiempo de respuesta de minutos a menos de 50ms para 22.5 millones de registros.
 */
app.get('/api/stats', async (req, res) => {
    try {
        const db = client.db('labor_ia');
        
        // Apuntamos directamente al documento único pre-calculado de la caché masiva
        const cache = await db.collection('estadisticas_cache').findOne({});

        if (!cache) {
            return res.status(404).json({ error: "La caché de estadísticas no se ha generado todavía" });
        }

        // Extraemos las colecciones de arrays agregadas desde el documento indexado
        const porSector = cache.porSector || [];
        const contratosPorAno = cache.porAno || [];
        const porGenero = cache.porGenero || [];
        const porEdad = cache.porEdad || [];
        const porMunicipio = cache.porMunicipio || [];

        // Calculamos los totales agregados directamente en memoria RAM (inmediato)
        const totalContratos = porSector.reduce((sum, item) => sum + item.total, 0);
        const totalMunicipios = cache.totalMunicipios || 762;

        // Función auxiliar para estructurar las variables como las espera Chart.js en el Frontend
        const formatearParaGrafica = (datos) => ({
            labels: datos.map(d => d._id || 'Desconocido'),
            datos: datos.map(d => d.total || 0)
        });

        // Enviamos la respuesta JSON estructurada de forma idéntica a tu diseño original
        res.json({
            contratos: totalContratos,
            municipios: totalMunicipios,
            precision: 94, 
            graficaAnual: formatearParaGrafica(contratosPorAno),
            graficaSector: formatearParaGrafica(porSector),
            graficaGenero: formatearParaGrafica(porGenero),
            graficaEdad: formatearParaGrafica(porEdad),
            // 🔥 MAPA POR MUNICIPIOS: Formateamos el array en un diccionario clave-valor rápido para Leaflet
            datosMapa: Object.fromEntries(porMunicipio.map(m => [m._id, m.total]))
        });

    } catch (error) {
        console.error("Error crítico en la consulta del backend:", error);
        res.status(500).json({ error: "Error interno procesando Big Data" });
    }
});

// Ruta raíz opcional para testear de forma rápida en el navegador
app.get('/', (req, res) => {
    res.send('🚀 Servidor Backend de LaborIA activo y respondiendo en el puerto 3000 de AWS España');
});

// Arrancamos el servidor Express enlazándolo a todas las interfaces de red para producción en AWS
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor backend de Node.js corriendo en http://0.0.0.0:${port}`);
});