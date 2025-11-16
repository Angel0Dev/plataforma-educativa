const { query } = require('../config/db.config');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

async function mostrarAdmin() {
    try {
        console.log('🔍 Verificando usuario administrador...\n');
        
        // Verificar conexión
        await query('SELECT NOW()');
        console.log('✅ Conexión a PostgreSQL establecida correctamente\n');

        // Verificar información de la base de datos
        const dbInfo = await query('SELECT current_database() as db, current_user as user');
        console.log(`📊 Base de datos actual: ${dbInfo.rows[0].db}`);
        console.log(`📊 Usuario actual: ${dbInfo.rows[0].user}\n`);

        // Verificar esquema
        const schemaInfo = await query("SELECT current_schema() as schema");
        console.log(`📊 Esquema actual: ${schemaInfo.rows[0].schema}\n`);

        // Verificar el usuario admin
        const admin = await query(
            `SELECT 
                id_usuario, 
                nombre, 
                apellido, 
                correo, 
                contrasena, 
                rol, 
                activo,
                fecha_creacion,
                fecha_actualizacion
            FROM Usuarios 
            WHERE correo = $1`,
            ['admin@plataforma.edu']
        );

        if (admin.rows.length === 0) {
            console.log('❌ Usuario admin@plataforma.edu NO encontrado\n');
            console.log('📝 Creando usuario administrador...\n');
            
            // Crear usuario admin
            const nombre = 'Admin';
            const apellido = 'Sistema';
            const correo = 'admin@plataforma.edu';
            const contrasena = 'admin123';
            const rol = 'Administrador';
            
            const saltRounds = 12;
            const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);
            
            const resultado = await query(
                `INSERT INTO Usuarios (nombre, apellido, correo, contrasena, rol, activo) 
                 VALUES ($1, $2, $3, $4, $5, true) 
                 RETURNING id_usuario, nombre, apellido, correo, rol, activo`,
                [nombre, apellido, correo, contrasenaHash, rol]
            );
            
            const nuevoAdmin = resultado.rows[0];
            console.log('✅ Usuario administrador creado exitosamente:');
            console.log(`   ID: ${nuevoAdmin.id_usuario}`);
            console.log(`   Nombre: ${nuevoAdmin.nombre} ${nuevoAdmin.apellido}`);
            console.log(`   Correo: ${nuevoAdmin.correo}`);
            console.log(`   Rol: ${nuevoAdmin.rol}`);
            console.log(`   Activo: ${nuevoAdmin.activo ? 'Sí' : 'No'}\n`);
        } else {
            const usuario = admin.rows[0];
            console.log('✅ Usuario administrador encontrado:');
            console.log(`   ID: ${usuario.id_usuario}`);
            console.log(`   Nombre: ${usuario.nombre} ${usuario.apellido}`);
            console.log(`   Correo: ${usuario.correo}`);
            console.log(`   Rol: ${usuario.rol}`);
            console.log(`   Activo: ${usuario.activo ? 'Sí' : 'No'}`);
            console.log(`   Fecha creación: ${usuario.fecha_creacion}`);
            console.log(`   Fecha actualización: ${usuario.fecha_actualizacion}`);
            console.log(`   Hash (primeros 30 chars): ${usuario.contrasena.substring(0, 30)}...\n`);
            
            // Verificar que la contraseña funciona
            console.log('🔐 Verificando contraseña...');
            const contrasenaValida = await bcrypt.compare('admin123', usuario.contrasena);
            console.log(`   ¿admin123 funciona?: ${contrasenaValida ? '✅ SÍ' : '❌ NO'}\n`);
            
            if (!contrasenaValida) {
                console.log('⚠️  La contraseña NO funciona. Actualizando...\n');
                const saltRounds = 12;
                const nuevoHash = await bcrypt.hash('admin123', saltRounds);
                
                await query(
                    `UPDATE Usuarios 
                     SET contrasena = $1, 
                         activo = true,
                         fecha_actualizacion = CURRENT_TIMESTAMP
                     WHERE correo = $2`,
                    [nuevoHash, 'admin@plataforma.edu']
                );
                
                console.log('✅ Contraseña actualizada correctamente\n');
            }
        }

        // Contar total de usuarios
        const total = await query('SELECT COUNT(*) as total FROM Usuarios');
        console.log(`📊 Total de usuarios en la base de datos: ${total.rows[0].total}\n`);

        console.log('📋 Credenciales de acceso:');
        console.log('   Correo: admin@plataforma.edu');
        console.log('   Contraseña: admin123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('   Detalles:', error);
        process.exit(1);
    }
}

mostrarAdmin();

