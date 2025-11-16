const { Pool } = require('pg');

// Configuración de la base de datos PostgreSQL
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'colegio',
    password: process.env.DB_PASSWORD || "8M~Yd'CM7rd#?nj",
    port: process.env.DB_PORT || 5432,
    // Configuraciones adicionales para el pool de conexiones
    max: 20, // máximo número de clientes en el pool
    idleTimeoutMillis: 30000, // cierra conexiones inactivas después de 30 segundos
    connectionTimeoutMillis: 2000, // tiempo de espera para conectar
};

// Crear el pool de conexiones
const pool = new Pool(dbConfig);

// Manejo de errores del pool
pool.on('error', (err) => {
    console.error('Error inesperado en el cliente inactivo del pool:', err);
    process.exit(-1);
});

// Función para probar la conexión
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Conexión a PostgreSQL establecida correctamente');
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con PostgreSQL:', error.message);
        return false;
    }
};

// Función para ejecutar consultas
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Consulta ejecutada:', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Error en la consulta:', error);
        throw error;
    }
};

// Función para obtener un cliente del pool
const getClient = async () => {
    return await pool.connect();
};

module.exports = {
    pool,
    query,
    getClient,
    testConnection
};
