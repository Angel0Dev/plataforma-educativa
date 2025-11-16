const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salon.controller');

// Ruta para obtener todos los salones
router.get('/', salonController.obtenerSalones);

// Ruta para obtener salones de un docente
router.get('/docente/:id_docente', salonController.obtenerSalonesPorDocente);

// Ruta para obtener estudiantes de un salón con sus padres
router.get('/:id_salon/estudiantes-con-padres', salonController.obtenerEstudiantesConPadres);

// Ruta para obtener un salón por ID con estudiantes
router.get('/:id', salonController.obtenerSalonPorId);

// Ruta para crear un nuevo salón
router.post('/', salonController.crearSalon);

// Ruta para actualizar un salón
router.put('/:id', salonController.actualizarSalon);

// Ruta para eliminar un salón (soft delete)
router.delete('/:id', salonController.eliminarSalon);

module.exports = router;

