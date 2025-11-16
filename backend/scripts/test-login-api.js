const fetch = require('node-fetch');

/**
 * Script para probar el endpoint de login directamente
 */
async function testLogin() {
    try {
        console.log('🧪 Probando endpoint de login...\n');
        
        const correo = 'admin@plataforma.edu';
        const contrasena = 'admin123';
        
        console.log(`📋 Credenciales:`);
        console.log(`   Correo: ${correo}`);
        console.log(`   Contraseña: "${contrasena}"`);
        console.log(`   Longitud: ${contrasena.length}`);
        console.log(`   Códigos ASCII: [${Array.from(contrasena).map(c => c.charCodeAt(0)).join(', ')}]\n`);
        
        console.log('🚀 Enviando petición a http://localhost:5000/api/auth/login...\n');
        
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                correo: correo,
                contrasena: contrasena
            }),
        });
        
        console.log(`📊 Respuesta del servidor:`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        const data = await response.json();
        console.log(`   Body:`, JSON.stringify(data, null, 2));
        
        if (data.success) {
            console.log('\n✅ ¡Login exitoso!');
            console.log(`   Usuario: ${data.user.nombre} ${data.user.apellido}`);
            console.log(`   Rol: ${data.user.rol}`);
        } else {
            console.log('\n❌ Login fallido');
            console.log(`   Mensaje: ${data.message}`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al probar login:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('   El servidor no está corriendo. Por favor, inicia el servidor con: npm start');
        }
        process.exit(1);
    }
}

// Ejecutar la función
testLogin();

