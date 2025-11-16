// Cargar variables de entorno
require('dotenv').config({ path: './config.env' });

const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const cursoRoutes = require('./routes/curso.routes');
const mensajeRoutes = require('./routes/mensaje.routes');
const matriculaRoutes = require('./routes/matricula.routes');
const salonRoutes = require('./routes/salon.routes');
const tareaRoutes = require('./routes/tarea.routes');
const horarioRoutes = require('./routes/horario.routes');
const { testConnection } = require('./config/db.config');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://[::1]:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para logging de requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rutas principales
app.use('/api/usuarios', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/matriculas', matriculaRoutes);
app.use('/api/salones', salonRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api/horarios', horarioRoutes);

// Ruta de salud del servidor
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = await testConnection();
        res.status(200).json({
            success: true,
            message: 'Servidor funcionando correctamente',
            timestamp: new Date().toISOString(),
            database: dbStatus ? 'Conectado' : 'Desconectado',
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
});

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido a la API de la Plataforma Educativa',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            usuarios: '/api/usuarios',
            auth: '/api/auth'
        }
    });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.originalUrl
    });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
    console.error('Error global:', error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Función para ejecutar limpieza automática de usuarios inactivos
const ejecutarLimpiezaAutomatica = async () => {
    try {
        const { query } = require('./config/db.config');
        const resultado = await query('SELECT * FROM ejecutar_limpieza_usuarios_inactivos()');
        
        if (resultado.rows.length > 0) {
            const limpieza = resultado.rows[0].ejecutar_limpieza_usuarios_inactivos;
            if (limpieza.usuarios_eliminados > 0) {
                console.log(`🧹 Limpieza automática: ${limpieza.usuarios_eliminados} usuario(s) inactivo(s) eliminado(s)`);
            }
        }
    } catch (error) {
        console.error('⚠️ Error en limpieza automática de usuarios inactivos:', error.message);
    }
};

// Iniciar servidor
const startServer = async () => {
    try {
        // Probar conexión a la base de datos
        console.log('🔍 Verificando conexión a la base de datos...');
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ No se pudo conectar a la base de datos. Verifique la configuración.');
            process.exit(1);
        }

        // Iniciar el servidor
        app.listen(PORT, () => {
            console.log(`
🚀 Servidor iniciado exitosamente!
📍 Puerto: ${PORT}
🌐 URL: http://localhost:${PORT}
📊 Estado de BD: ${dbConnected ? 'Conectada ✅' : 'Desconectada ❌'}
🔧 Entorno: ${process.env.NODE_ENV || 'development'}
            `);
        });

        // Ejecutar limpieza automática al iniciar el servidor (solo si hay usuarios inactivos)
        setTimeout(() => ejecutarLimpiezaAutomatica(), 5000); // Esperar 5 segundos después del inicio

        // Programar limpieza automática diaria a las 2:00 AM
        const programarLimpiezaDiaria = () => {
            const ahora = new Date();
            const proximaEjecucion = new Date();
            proximaEjecucion.setHours(2, 0, 0, 0);
            
            // Si ya pasaron las 2:00 AM hoy, programar para mañana
            if (proximaEjecucion <= ahora) {
                proximaEjecucion.setDate(proximaEjecucion.getDate() + 1);
            }
            
            const tiempoHastaEjecucion = proximaEjecucion - ahora;
            
            setTimeout(() => {
                ejecutarLimpiezaAutomatica();
                // Reprogramar para el siguiente día
                programarLimpiezaDiaria();
            }, tiempoHastaEjecucion);
            
            const horas = Math.floor(tiempoHastaEjecucion / (1000 * 60 * 60));
            const minutos = Math.floor((tiempoHastaEjecucion % (1000 * 60 * 60)) / (1000 * 60));
            console.log(`🧹 Limpieza automática programada para las 2:00 AM (en ${horas}h ${minutos}m)`);
        };
        
        programarLimpiezaDiaria();

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
    console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
    process.exit(0);
});

// Iniciar el servidor
startServer();

module.exports = app;
