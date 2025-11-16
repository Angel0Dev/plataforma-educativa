const bcrypt = require('bcryptjs');
const { query } = require('../config/db.config');
require('dotenv').config({ path: './config.env' });

async function crearUsuarioAdmin() {
    try {
        console.log('🔍 Verificando conexión a la base de datos...');
        
        // Verificar conexión
        const testConnection = await query('SELECT NOW()');
        console.log('✅ Conexión a PostgreSQL establecida correctamente\n');

        const nombre = 'Admin';
        const apellido = 'Sistema';
        const correo = 'admin@plataforma.edu';
        const contrasena = 'admin123';
        const rol = 'Administrador';

        // Verificar si el usuario ya existe
        const usuarioExistente = await query(
            'SELECT id_usuario, correo, rol FROM Usuarios WHERE correo = $1',
            [correo]
        );

        if (usuarioExistente.rows.length > 0) {
            console.log('⚠️  El usuario administrador ya existe.');
            console.log('   Actualizando información...\n');
            
            // Hash de la contraseña
            const saltRounds = 12;
            const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);

            // Actualizar usuario existente
            const resultado = await query(
                `UPDATE Usuarios 
                 SET nombre = $1, 
                     apellido = $2, 
                     contrasena = $3, 
                     rol = $4, 
                     activo = true,
                     fecha_actualizacion = CURRENT_TIMESTAMP
                 WHERE correo = $5
                 RETURNING id_usuario, nombre, apellido, correo, rol, activo`,
                [nombre, apellido, contrasenaHash, rol, correo]
            );

            const usuario = resultado.rows[0];
            console.log('✅ Usuario administrador actualizado exitosamente:');
            console.log(`   ID: ${usuario.id_usuario}`);
            console.log(`   Nombre: ${usuario.nombre} ${usuario.apellido}`);
            console.log(`   Correo: ${usuario.correo}`);
            console.log(`   Rol: ${usuario.rol}`);
            console.log(`   Activo: ${usuario.activo ? 'Sí' : 'No'}\n`);
        } else {
            console.log('📝 Creando nuevo usuario administrador...\n');
            
            // Hash de la contraseña
            const saltRounds = 12;
            const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);

            // Insertar nuevo usuario
            const resultado = await query(
                `INSERT INTO Usuarios (nombre, apellido, correo, contrasena, rol, activo) 
                 VALUES ($1, $2, $3, $4, $5, true) 
                 RETURNING id_usuario, nombre, apellido, correo, rol, activo`,
                [nombre, apellido, correo, contrasenaHash, rol]
            );

            const usuario = resultado.rows[0];
            console.log('✅ Usuario administrador creado exitosamente:');
            console.log(`   ID: ${usuario.id_usuario}`);
            console.log(`   Nombre: ${usuario.nombre} ${usuario.apellido}`);
            console.log(`   Correo: ${usuario.correo}`);
            console.log(`   Rol: ${usuario.rol}`);
            console.log(`   Activo: ${usuario.activo ? 'Sí' : 'No'}\n`);
        }

        console.log('📋 Credenciales de acceso:');
        console.log(`   Correo: ${correo}`);
        console.log(`   Contraseña: ${contrasena}\n`);
        console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear usuario administrador:', error.message);
        console.error('   Detalles:', error);
        process.exit(1);
    }
}

// Ejecutar la función
crearUsuarioAdmin();

