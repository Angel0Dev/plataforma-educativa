const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensaje.controller');
const upload = require('../middleware/upload');

// Ruta para enviar un mensaje (con soporte de archivos)
router.post('/', upload.single('archivo'), mensajeController.enviarMensaje);

// Rutas específicas (deben estar antes de las dinámicas)
// Ruta para obtener mensajes de un usuario
router.get('/usuario/:id_usuario', mensajeController.obtenerMensajes);

// Ruta para obtener estadísticas de mensajes
router.get('/estadisticas/:id_usuario', mensajeController.obtenerEstadisticasMensajes);

// Ruta para marcar mensaje como leído (debe estar antes de /:id_mensaje)
router.put('/:id_mensaje/leido', mensajeController.marcarComoLeido);

// Ruta para editar un mensaje (con soporte de archivos)
router.put('/:id_mensaje', upload.single('archivo'), mensajeController.editarMensaje);

// Ruta para obtener un mensaje por ID (debe estar al final)
router.get('/:id_mensaje', mensajeController.obtenerMensajePorId);

module.exports = router;
