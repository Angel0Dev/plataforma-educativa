const bcrypt = require('bcryptjs');
const { query } = require('../config/db.config');
require('dotenv').config({ path: './config.env' });

/**
 * Script para probar la comparación de contraseñas
 */
async function testPassword() {
    try {
        console.log('🔍 Verificando conexión a la base de datos...');
        
        // Verificar conexión
        await query('SELECT NOW()');
        console.log('✅ Conexión a PostgreSQL establecida correctamente\n');

        const correo = 'admin@plataforma.edu';
        const contrasenaPrueba = 'admin123';

        // Obtener usuario de la BD
        console.log(`📋 Buscando usuario: ${correo}`);
        const usuario = await query(
            'SELECT id_usuario, nombre, apellido, correo, contrasena, rol FROM Usuarios WHERE correo = $1',
            [correo]
        );

        if (usuario.rows.length === 0) {
            console.log(`❌ Usuario no encontrado: ${correo}`);
            process.exit(1);
        }

        const usuarioData = usuario.rows[0];
        console.log(`✅ Usuario encontrado:`);
        console.log(`   ID: ${usuarioData.id_usuario}`);
        console.log(`   Nombre: ${usuarioData.nombre} ${usuarioData.apellido}`);
        console.log(`   Correo: ${usuarioData.correo}`);
        console.log(`   Rol: ${usuarioData.rol}`);
        console.log(`   Hash (completo): ${usuarioData.contrasena}`);
        console.log(`   Hash (longitud): ${usuarioData.contrasena.length}\n`);

        // Probar diferentes variaciones de la contraseña
        console.log('🔐 Probando comparación de contraseñas...\n');
        
        const variaciones = [
            contrasenaPrueba,
            contrasenaPrueba.trim(),
            contrasenaPrueba + ' ',
            ' ' + contrasenaPrueba,
            contrasenaPrueba + '\n',
            contrasenaPrueba + '\r',
        ];

        for (let i = 0; i < variaciones.length; i++) {
            const variacion = variaciones[i];
            console.log(`   Prueba ${i + 1}: "${variacion}" (longitud: ${variacion.length})`);
            
            try {
                const esValida = await bcrypt.compare(variacion, usuarioData.contrasena);
                console.log(`      Resultado: ${esValida ? '✅ VÁLIDA' : '❌ Inválida'}`);
                
                if (esValida) {
                    console.log(`\n🎉 ¡CONTRASEÑA CORRECTA ENCONTRADA!`);
                    console.log(`   Contraseña que funciona: "${variacion}"`);
                    console.log(`   Longitud: ${variacion.length}`);
                    console.log(`   Códigos ASCII: ${Array.from(variacion).map(c => c.charCodeAt(0)).join(', ')}\n`);
                    break;
                }
            } catch (error) {
                console.log(`      Error: ${error.message}`);
            }
        }

        // Generar un nuevo hash y compararlo
        console.log('\n🔧 Generando nuevo hash para "admin123"...');
        const nuevoHash = await bcrypt.hash('admin123', 12);
        console.log(`   Nuevo hash: ${nuevoHash}`);
        
        const nuevaComparacion = await bcrypt.compare('admin123', nuevoHash);
        console.log(`   Comparación con nuevo hash: ${nuevaComparacion ? '✅ VÁLIDA' : '❌ Inválida'}\n`);

        // Comparar el hash de la BD con uno nuevo generado
        console.log('🔍 Comparando hash de BD con nuevo hash...');
        console.log(`   Hash BD: ${usuarioData.contrasena.substring(0, 29)}...`);
        console.log(`   Nuevo hash: ${nuevoHash.substring(0, 29)}...`);
        console.log(`   ¿Son iguales?: ${usuarioData.contrasena === nuevoHash ? 'Sí' : 'No (normal, cada hash es único)'}\n`);

        // Verificar el formato del hash
        console.log('📊 Análisis del hash:');
        const hashParts = usuarioData.contrasena.split('$');
        console.log(`   Algoritmo: ${hashParts[1]}`);
        console.log(`   Salt rounds: ${hashParts[2]}`);
        console.log(`   Salt: ${hashParts[3].substring(0, 22)}...`);
        console.log(`   Hash: ${hashParts[3].substring(22)}...\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al probar contraseña:', error.message);
        console.error('   Detalles:', error);
        process.exit(1);
    }
}

// Ejecutar la función
testPassword();

