const bcrypt = require('bcryptjs');
const pool = require('../config/db.config');

// Script para insertar usuarios de prueba
const insertTestUsers = async () => {
    try {
        console.log('🚀 Iniciando inserción de usuarios de prueba...');

        // Verificar conexión a la base de datos
        await pool.query('SELECT 1');
        console.log('✅ Conexión a la base de datos establecida');

        // Datos de usuarios de prueba
        const testUsers = [
            {
                nombre: 'Juan',
                apellido: 'Pérez',
                correo: 'estudiante@test.com',
                contrasena: 'password123',
                rol: 'Estudiante'
            },
            {
                nombre: 'María',
                apellido: 'González',
                correo: 'docente@test.com',
                contrasena: 'password123',
                rol: 'Docente'
            },
            {
                nombre: 'Carlos',
                apellido: 'Rodríguez',
                correo: 'padre@test.com',
                contrasena: 'password123',
                rol: 'Padre'
            },
            {
                nombre: 'Admin',
                apellido: 'Sistema',
                correo: 'admin@test.com',
                contrasena: 'password123',
                rol: 'Administrador'
            }
        ];

        // Verificar si los usuarios ya existen
        for (const user of testUsers) {
            const existingUser = await pool.query(
                'SELECT id_usuario FROM Usuarios WHERE correo = $1',
                [user.correo]
            );

            if (existingUser.rows.length > 0) {
                console.log(`⚠️  Usuario ${user.correo} ya existe, actualizando contraseña...`);
                
                // Actualizar contraseña
                const hashedPassword = await bcrypt.hash(user.contrasena, 12);
                await pool.query(
                    'UPDATE Usuarios SET contrasena = $1 WHERE correo = $2',
                    [hashedPassword, user.correo]
                );
                console.log(`✅ Contraseña actualizada para ${user.correo}`);
            } else {
                // Insertar nuevo usuario
                const hashedPassword = await bcrypt.hash(user.contrasena, 12);
                const result = await pool.query(
                    `INSERT INTO Usuarios (nombre, apellido, correo, contrasena, rol) 
                     VALUES ($1, $2, $3, $4, $5) 
                     RETURNING id_usuario, nombre, apellido, correo, rol`,
                    [user.nombre, user.apellido, user.correo, hashedPassword, user.rol]
                );

                console.log(`✅ Usuario creado: ${result.rows[0].nombre} ${result.rows[0].apellido} (${result.rows[0].rol})`);
            }
        }

        console.log('🎉 Usuarios de prueba configurados correctamente');
        console.log('\n📋 Credenciales de prueba:');
        console.log('👨‍🎓 Estudiante: estudiante@test.com / password123');
        console.log('👨‍🏫 Docente: docente@test.com / password123');
        console.log('👨‍👩‍👧‍👦 Padre: padre@test.com / password123');
        console.log('👑 Administrador: admin@test.com / password123');

    } catch (error) {
        console.error('❌ Error al insertar usuarios de prueba:', error);
        throw error;
    } finally {
        // No necesitamos cerrar la conexión del pool
        console.log('📝 Usuarios de prueba configurados exitosamente');
    }
};

// Ejecutar el script si se llama directamente
if (require.main === module) {
    insertTestUsers()
        .then(() => {
            console.log('✅ Script completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en el script:', error);
            process.exit(1);
        });
}

module.exports = insertTestUsers;
