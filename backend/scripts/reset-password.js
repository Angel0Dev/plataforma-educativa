const bcrypt = require('bcryptjs');
const { query } = require('../config/db.config');
require('dotenv').config({ path: './config.env' });

/**
 * Script para resetear la contraseña de un usuario
 * Uso: node scripts/reset-password.js <correo> <nueva_contraseña>
 * Ejemplo: node scripts/reset-password.js admin@plataforma.edu admin123
 */
async function resetPassword() {
    try {
        const correo = process.argv[2];
        const nuevaContrasena = process.argv[3];

        if (!correo || !nuevaContrasena) {
            console.log('❌ Uso: node scripts/reset-password.js <correo> <nueva_contraseña>');
            console.log('   Ejemplo: node scripts/reset-password.js admin@plataforma.edu admin123');
            process.exit(1);
        }

        console.log('🔍 Verificando conexión a la base de datos...');
        
        // Verificar conexión
        await query('SELECT NOW()');
        console.log('✅ Conexión a PostgreSQL establecida correctamente\n');

        // Buscar usuario
        const usuario = await query(
            'SELECT id_usuario, nombre, apellido, correo, rol, contrasena FROM Usuarios WHERE correo = $1',
            [correo]
        );

        if (usuario.rows.length === 0) {
            console.log(`❌ Usuario con correo ${correo} no encontrado`);
            process.exit(1);
        }

        const usuarioData = usuario.rows[0];
        console.log(`✅ Usuario encontrado:`);
        console.log(`   ID: ${usuarioData.id_usuario}`);
        console.log(`   Nombre: ${usuarioData.nombre} ${usuarioData.apellido}`);
        console.log(`   Correo: ${usuarioData.correo}`);
        console.log(`   Rol: ${usuarioData.rol}`);
        console.log(`   Hash actual (primeros 20 chars): ${usuarioData.contrasena.substring(0, 20)}...`);
        console.log(`   Longitud del hash: ${usuarioData.contrasena.length}\n`);

        // Generar nuevo hash
        console.log('🔐 Generando nuevo hash de contraseña...');
        const saltRounds = 12;
        const nuevoHash = await bcrypt.hash(nuevaContrasena, saltRounds);
        console.log(`   Nuevo hash (primeros 20 chars): ${nuevoHash.substring(0, 20)}...`);
        console.log(`   Longitud del nuevo hash: ${nuevoHash.length}\n`);

        // Verificar que el nuevo hash funciona
        const verificarHash = await bcrypt.compare(nuevaContrasena, nuevoHash);
        if (!verificarHash) {
            console.log('❌ Error: El nuevo hash no coincide con la contraseña proporcionada');
            process.exit(1);
        }
        console.log('✅ Verificación del nuevo hash: OK\n');

        // Actualizar contraseña
        console.log('💾 Actualizando contraseña en la base de datos...');
        const resultado = await query(
            `UPDATE Usuarios 
             SET contrasena = $1, 
                 fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE correo = $2
             RETURNING id_usuario, nombre, apellido, correo, rol`,
            [nuevoHash, correo]
        );

        const usuarioActualizado = resultado.rows[0];
        console.log('✅ Contraseña actualizada exitosamente\n');

        // Verificar que la nueva contraseña funciona
        console.log('🔍 Verificando que la nueva contraseña funciona...');
        const usuarioVerificar = await query(
            'SELECT contrasena FROM Usuarios WHERE correo = $1',
            [correo]
        );
        
        const hashEnBD = usuarioVerificar.rows[0].contrasena;
        const contrasenaValida = await bcrypt.compare(nuevaContrasena, hashEnBD);
        
        if (contrasenaValida) {
            console.log('✅ Verificación exitosa: La contraseña funciona correctamente\n');
        } else {
            console.log('❌ ADVERTENCIA: La verificación falló. Puede haber un problema.\n');
        }

        console.log('📋 Credenciales actualizadas:');
        console.log(`   Correo: ${correo}`);
        console.log(`   Contraseña: ${nuevaContrasena}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al resetear contraseña:', error.message);
        console.error('   Detalles:', error);
        process.exit(1);
    }
}

// Ejecutar la función
resetPassword();

