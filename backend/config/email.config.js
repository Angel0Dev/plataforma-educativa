const nodemailer = require('nodemailer');
require('dotenv').config({ path: './config.env' });

// Función para limpiar valores de variables de entorno
const limpiarVariable = (valor) => {
    if (!valor) return '';
    // Eliminar comillas al inicio y final
    return String(valor).replace(/^["']|["']$/g, '').trim();
};

// Obtener y limpiar las variables de entorno
const emailHost = limpiarVariable(process.env.EMAIL_HOST) || 'smtp.gmail.com';
const emailPort = parseInt(process.env.EMAIL_PORT) || 587;
const emailUser = limpiarVariable(process.env.EMAIL_USER);
const emailPass = limpiarVariable(process.env.EMAIL_PASS);

// Verificar si las credenciales están configuradas
const emailConfigurado = emailUser && emailPass;

// Configurar el transporter de nodemailer solo si hay credenciales
let transporter = null;

if (emailConfigurado) {
    // Configuración para Gmail
    transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465, // true para 465, false para otros puertos
        auth: {
            user: emailUser,
            pass: emailPass
        },
        // Configuración adicional para Gmail
        tls: {
            // No fallar en certificados inválidos (útil para desarrollo)
            rejectUnauthorized: false
        }
    });

    // Verificar la configuración del transporter de forma asíncrona
    transporter.verify(function (error, success) {
        if (error) {
            console.log('⚠️ Error en la configuración de email:', error.message);
            if (error.code === 'EAUTH') {
                console.log('   Error de autenticación. Verifica:');
                console.log('   1. Que EMAIL_USER sea correcto');
                console.log('   2. Que EMAIL_PASS sea una "Contraseña de aplicación" de Gmail');
                console.log('   3. Que la verificación en 2 pasos esté habilitada en tu cuenta');
            }
            console.log('   Los correos se simularán en consola hasta que se configuren las credenciales correctamente.');
        } else {
            console.log('✅ Servidor de correo configurado y listo para enviar mensajes');
            console.log(`   Host: ${emailHost}`);
            console.log(`   Puerto: ${emailPort}`);
            console.log(`   Usuario: ${emailUser}`);
        }
    });
} else {
    console.log('ℹ️ Credenciales de email no configuradas. Los correos se simularán en consola.');
    console.log('   Para habilitar el envío de correos, configure en config.env:');
    console.log('   - EMAIL_USER (tu correo Gmail)');
    console.log('   - EMAIL_PASS (contraseña de aplicación de Gmail)');
    console.log('   - EMAIL_HOST (opcional, por defecto smtp.gmail.com)');
    console.log('   - EMAIL_PORT (opcional, por defecto 587)');
}

// Función para enviar correo
const enviarCorreo = async (destinatario, asunto, contenidoHTML, opciones = {}) => {
    try {
        // Si no hay configuración de email, solo loguear (modo desarrollo)
        if (!emailConfigurado || !transporter) {
            console.log('\n=== 📧 CORREO SIMULADO (credenciales no configuradas) ===');
            console.log('Destinatario:', destinatario);
            console.log('Asunto:', asunto);
            console.log('Contenido HTML:');
            console.log(contenidoHTML.substring(0, 200) + (contenidoHTML.length > 200 ? '...' : ''));
            console.log('========================================================\n');
            return { success: true, message: 'Correo simulado (credenciales no configuradas)' };
        }

        // Preparar opciones del correo
        const mailOptions = {
            from: opciones.from || `"Plataforma Educativa JMA" <${emailUser}>`,
            to: destinatario,
            subject: asunto,
            html: contenidoHTML,
            // Agregar opciones adicionales si se proporcionan
            ...opciones
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Correo enviado exitosamente');
        console.log(`   Destinatario: ${destinatario}`);
        console.log(`   Asunto: ${asunto}`);
        console.log(`   Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId, message: 'Correo enviado exitosamente' };
    } catch (error) {
        console.error('❌ Error al enviar correo:', error.message);
        
        // Manejo de errores específicos
        if (error.code === 'EAUTH') {
            console.error('   Error de autenticación. Verifica tus credenciales de Gmail.');
            console.error('   Asegúrate de usar una "Contraseña de aplicación" y no tu contraseña regular.');
        } else if (error.code === 'ECONNECTION') {
            console.error('   Error de conexión. Verifica tu conexión a internet y la configuración del servidor SMTP.');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('   Timeout al conectar con el servidor de correo.');
        }
        
        // En caso de error, simular el envío para no interrumpir el flujo (modo desarrollo)
        if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Simulando envío en modo desarrollo debido al error...');
            return { success: true, message: `Correo simulado (error: ${error.message})` };
        }
        
        return { success: false, error: error.message };
    }
};

module.exports = {
    enviarCorreo
};

