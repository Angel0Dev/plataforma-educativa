const express = require('express');
const router = express.Router();
const matriculaController = require('../controllers/matricula.controller');

// Ruta para obtener todas las matrículas
router.get('/', matriculaController.obtenerMatriculas);

// Ruta para matricular un estudiante en un curso
router.post('/', matriculaController.matricularEstudiante);

// Ruta para actualizar el estado de una matrícula
router.put('/:id_matricula/estado', matriculaController.actualizarEstadoMatricula);

// Ruta para obtener estudiantes no matriculados en un curso específico
router.get('/curso/:id_curso/estudiantes-no-matriculados', matriculaController.obtenerEstudiantesNoMatriculados);

// Ruta para obtener estadísticas de matrículas
router.get('/estadisticas', matriculaController.obtenerEstadisticasMatriculas);

// Ruta para obtener matrículas de un estudiante específico
router.get('/estudiante/:id_estudiante', matriculaController.obtenerMatriculasPorEstudiante);

module.exports = router;

