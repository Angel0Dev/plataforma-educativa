const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

async function verificarBasesDatos() {
    const dbConfig = {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        password: process.env.DB_PASSWORD || "8M~Yd'CM7rd#?nj",
        port: process.env.DB_PORT || 5432,
    };

    const pool = new Pool(dbConfig);

    try {
        console.log('🔍 Verificando bases de datos...\n');
        
        // Listar todas las bases de datos
        const databases = await pool.query(`
            SELECT datname 
            FROM pg_database 
            WHERE datistemplate = false 
            AND datname NOT IN ('postgres', 'template0', 'template1')
            ORDER BY datname
        `);
        
        console.log('📊 Bases de datos encontradas:');
        databases.rows.forEach((db, index) => {
            console.log(`   ${index + 1}. ${db.datname}`);
        });
        console.log('');

        // Verificar cada base de datos
        for (const db of databases.rows) {
            const dbName = db.datname;
            console.log(`🔍 Verificando base de datos: ${dbName}`);
            
            try {
                // Conectar a esta base de datos
                const testPool = new Pool({
                    ...dbConfig,
                    database: dbName
                });
                
                // Verificar si la tabla Usuarios existe
                const tableExists = await testPool.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = 'Usuarios'
                    );
                `);
                
                if (tableExists.rows[0].exists) {
                    console.log(`   ✅ Tabla "Usuarios" existe`);
                    
                    // Contar usuarios
                    const usuarios = await testPool.query('SELECT COUNT(*) as total FROM Usuarios');
                    console.log(`   📊 Total de usuarios: ${usuarios.rows[0].total}`);
                    
                    // Verificar si existe el usuario admin
                    const admin = await testPool.query(
                        "SELECT id_usuario, nombre, apellido, correo, rol, activo FROM Usuarios WHERE correo = 'admin@plataforma.edu'"
                    );
                    
                    if (admin.rows.length > 0) {
                        console.log(`   ✅ Usuario admin encontrado: ${admin.rows[0].nombre} ${admin.rows[0].apellido}`);
                    } else {
                        console.log(`   ❌ Usuario admin NO encontrado`);
                    }
                } else {
                    console.log(`   ❌ Tabla "Usuarios" NO existe`);
                }
                
                await testPool.end();
            } catch (error) {
                console.log(`   ❌ Error al verificar: ${error.message}`);
            }
            
            console.log('');
        }

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
        process.exit(1);
    }
}

verificarBasesDatos();

