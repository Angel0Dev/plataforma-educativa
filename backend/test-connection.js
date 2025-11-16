const { Pool } = require('pg');

// Configuración de prueba para PostgreSQL
const config = {
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Conectamos a la BD por defecto primero
    password: '8M~Yd\'CM7rd#?nj',
    port: 5432,
};

console.log('🔍 Probando conexión a PostgreSQL...');
console.log('Configuración:', {
    user: config.user,
    host: config.host,
    database: config.database,
    port: config.port,
    password: '***' // No mostramos la contraseña completa
});

const pool = new Pool(config);

async function testConnection() {
    try {
        console.log('\n1. Probando conexión básica...');
        const client = await pool.connect();
        console.log('✅ Conexión exitosa a PostgreSQL');
        
        console.log('\n2. Verificando versión de PostgreSQL...');
        const versionResult = await client.query('SELECT version()');
        console.log('📊 Versión:', versionResult.rows[0].version.split(' ')[0]);
        
        console.log('\n3. Listando bases de datos disponibles...');
        const dbResult = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
        console.log('🗄️  Bases de datos:');
        dbResult.rows.forEach(row => {
            console.log('   -', row.datname);
        });
        
        console.log('\n4. Verificando si existe la BD plataforma_educativa...');
        const existsResult = await client.query("SELECT 1 FROM pg_database WHERE datname = 'plataforma_educativa'");
        if (existsResult.rows.length > 0) {
            console.log('✅ La base de datos "plataforma_educativa" existe');
        } else {
            console.log('❌ La base de datos "plataforma_educativa" NO existe');
            console.log('💡 Necesitas crear la base de datos primero en pgAdmin4');
        }
        
        client.release();
        
    } catch (error) {
        console.error('\n❌ Error de conexión:', error.message);
        
        // Diagnóstico de errores comunes
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔧 Posibles soluciones:');
            console.log('   1. Verifica que PostgreSQL esté ejecutándose');
            console.log('   2. En Windows: Verifica el servicio "postgresql-x64-XX" en Services');
            console.log('   3. Reinicia el servicio de PostgreSQL');
        } else if (error.code === '28P01') {
            console.log('\n🔧 Error de autenticación:');
            console.log('   1. Verifica que la contraseña sea correcta');
            console.log('   2. Verifica que el usuario "postgres" exista');
            console.log('   3. En pgAdmin4, prueba conectarte con estas credenciales');
        } else if (error.code === '3D000') {
            console.log('\n🔧 Base de datos no encontrada:');
            console.log('   1. La base de datos "postgres" no existe');
            console.log('   2. Prueba conectar a una base de datos diferente');
        }
        
    } finally {
        await pool.end();
    }
}

testConnection();
