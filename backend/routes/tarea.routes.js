const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tarea.controller');

// Ruta para crear una tarea
router.post('/', tareaController.crearTarea);

// Ruta para obtener tareas de un curso
router.get('/curso/:id_curso', tareaController.obtenerTareasPorCurso);

// Ruta para obtener tareas de un estudiante
router.get('/estudiante/:id_estudiante', tareaController.obtenerTareasPorEstudiante);

// Ruta para obtener entregas de una tarea
router.get('/:id_tarea/entregas', tareaController.obtenerEntregasPorTarea);

// Ruta para obtener estudiantes con entregas de una tarea (para evaluación)
router.get('/:id_tarea/estudiantes-con-entregas', tareaController.obtenerEstudiantesConEntregas);

// Ruta para crear una entrega
router.post('/entregas', tareaController.crearEntrega);

// Ruta para calificar una entrega
router.put('/entregas/:id_entrega/calificar', tareaController.calificarEntrega);

module.exports = router;

