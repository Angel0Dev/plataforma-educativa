const { enviarCorreo } = require('../config/email.config');

async function testEmail() {
    try {
        console.log('🧪 Probando configuración de correo...\n');
        
        const destinatario = process.env.EMAIL_USER || 'test@example.com';
        const asunto = 'Prueba de Configuración - Plataforma Educativa';
        const contenidoHTML = `
            <html>
                <body>
                    <h2>Prueba de Correo</h2>
                    <p>Este es un correo de prueba para verificar que la configuración de email está funcionando correctamente.</p>
                    <p>Si recibes este correo, significa que la configuración es exitosa.</p>
                    <hr>
                    <p><small>Plataforma Educativa JMA</small></p>
                </body>
            </html>
        `;
        
        console.log(`📧 Enviando correo de prueba a: ${destinatario}\n`);
        
        const resultado = await enviarCorreo(destinatario, asunto, contenidoHTML);
        
        if (resultado.success) {
            console.log('\n✅ Correo enviado exitosamente');
            console.log(`   Message ID: ${resultado.messageId || 'N/A'}`);
            console.log(`   Mensaje: ${resultado.message}`);
        } else {
            console.log('\n❌ Error al enviar correo');
            console.log(`   Error: ${resultado.error}`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Esperar un momento para que el transporter se configure
setTimeout(() => {
    testEmail();
}, 2000);

