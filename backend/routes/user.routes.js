const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { validarRegistro, validarIdUsuario } = require('../middleware/validation');

// Ruta para registrar un nuevo usuario
router.post('/registro', validarRegistro, userController.registrarUsuario);

// Ruta para obtener todos los usuarios (para administración)
router.get('/', userController.obtenerUsuarios);

// Ruta para buscar estudiantes por nombre o DNI (debe estar antes de las rutas dinámicas)
router.get('/buscar-estudiantes', userController.buscarEstudiantes);

// IMPORTANTE: Las rutas específicas deben estar ANTES de las rutas dinámicas
// Ruta para que un padre registre a su hijo (genera correo y contraseña automáticamente)
router.post('/padre/registrar-hijo', userController.registrarHijoPorPadre);

// Ruta para vincular un padre con un estudiante
router.post('/vincular-padre', userController.vincularPadreEstudiante);

// Ruta para que un padre actualice el correo y contraseña de su hijo
router.put('/padre/actualizar-credenciales', userController.actualizarCredencialesHijo);

// Rutas dinámicas (deben estar después de las rutas específicas)
// Ruta para obtener las matrículas de los hijos de un padre
router.get('/padre/:id_padre/hijos/matriculas', userController.obtenerMatriculasHijos);

// Ruta para obtener información del padre de un estudiante
router.get('/estudiante/:id_estudiante/padre', userController.obtenerPadreEstudiante);

// Ruta para obtener los hijos de un padre
router.get('/padre/:id_padre/hijos', userController.obtenerHijosPadre);

// Ruta para obtener un usuario específico por ID (debe estar al final)
router.get('/:id', validarIdUsuario, userController.obtenerUsuarioPorId);

module.exports = router;
