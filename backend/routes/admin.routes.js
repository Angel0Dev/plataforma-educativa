const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Verificar que la función eliminarUsuario existe
if (!adminController.eliminarUsuario) {
    console.error('ERROR: adminController.eliminarUsuario no está definido');
} else {
    console.log('✓ adminController.eliminarUsuario está disponible');
}

// Ruta para obtener estadísticas generales del sistema
router.get('/estadisticas', adminController.obtenerEstadisticas);

// Ruta para obtener todos los usuarios con información detallada
router.get('/usuarios', adminController.obtenerUsuariosCompletos);

// Ruta para crear un nuevo usuario (solo administradores)
router.post('/usuarios', adminController.crearUsuario);

// IMPORTANTE: Las rutas específicas deben ir ANTES de las rutas dinámicas
// Ruta para cambiar el rol de un usuario
router.put('/usuarios/:id/rol', adminController.cambiarRolUsuario);

// Ruta para eliminar un usuario (soft delete)
router.delete('/usuarios/:id', adminController.eliminarUsuario);

// Ruta para obtener estudiantes matriculados en un curso
router.get('/cursos/:id_curso/estudiantes', adminController.obtenerEstudiantesMatriculados);

// Ruta para crear padre e hijo con asignación de salón
router.post('/crear-padre-hijo', adminController.crearPadreEHijo);

// Ruta para actualizar credenciales de cualquier usuario (solo administradores)
router.put('/actualizar-credenciales', adminController.actualizarCredencialesUsuario);

// Ruta para ejecutar limpieza automática de usuarios inactivos
router.post('/limpiar-usuarios-inactivos', adminController.ejecutarLimpiezaUsuariosInactivos);

module.exports = router;
