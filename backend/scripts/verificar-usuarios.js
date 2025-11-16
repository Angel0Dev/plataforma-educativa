const { query } = require('../config/db.config');
require('dotenv').config({ path: './config.env' });

async function verificarUsuarios() {
    try {
        console.log('🔍 Verificando usuarios en la base de datos...\n');
        
        // Verificar conexión
        await query('SELECT NOW()');
        console.log('✅ Conexión a PostgreSQL establecida correctamente\n');

        // Verificar todos los usuarios
        const usuarios = await query(
            'SELECT id_usuario, nombre, apellido, correo, rol, activo FROM Usuarios ORDER BY id_usuario'
        );

        console.log(`📊 Total de usuarios encontrados: ${usuarios.rows.length}\n`);

        if (usuarios.rows.length === 0) {
            console.log('⚠️  No hay usuarios en la base de datos.\n');
            console.log('   Ejecuta: node scripts/insert-admin-user.js\n');
        } else {
            console.log('📋 Usuarios en la base de datos:\n');
            usuarios.rows.forEach((usuario, index) => {
                console.log(`${index + 1}. ID: ${usuario.id_usuario}`);
                console.log(`   Nombre: ${usuario.nombre} ${usuario.apellido}`);
                console.log(`   Correo: ${usuario.correo}`);
                console.log(`   Rol: ${usuario.rol}`);
                console.log(`   Activo: ${usuario.activo ? 'Sí' : 'No'}\n`);
            });
        }

        // Verificar específicamente el usuario admin
        const admin = await query(
            'SELECT id_usuario, nombre, apellido, correo, rol, activo FROM Usuarios WHERE correo = $1',
            ['admin@plataforma.edu']
        );

        if (admin.rows.length === 0) {
            console.log('❌ Usuario admin@plataforma.edu NO encontrado\n');
        } else {
            console.log('✅ Usuario admin@plataforma.edu encontrado:');
            console.log(`   ID: ${admin.rows[0].id_usuario}`);
            console.log(`   Nombre: ${admin.rows[0].nombre} ${admin.rows[0].apellido}`);
            console.log(`   Rol: ${admin.rows[0].rol}`);
            console.log(`   Activo: ${admin.rows[0].activo ? 'Sí' : 'No'}\n`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al verificar usuarios:', error.message);
        console.error('   Detalles:', error);
        process.exit(1);
    }
}

verificarUsuarios();

