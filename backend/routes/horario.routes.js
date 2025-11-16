const express = require('express');
const router = express.Router();
const horarioController = require('../controllers/horario.controller');

// Rutas para docentes de curso
router.get('/curso/:id_curso/docentes', horarioController.obtenerDocentesCurso);
router.post('/curso/:id_curso/docentes', horarioController.agregarDocenteCurso);
router.delete('/curso/:id_curso/docentes/:id_docente', horarioController.eliminarDocenteCurso);

// Rutas para horarios
router.get('/curso/:id_curso/horarios', horarioController.obtenerHorariosCurso);
router.post('/horarios', horarioController.crearHorario);
router.put('/horarios/:id_horario', horarioController.actualizarHorario);
router.delete('/horarios/:id_horario', horarioController.eliminarHorario);

module.exports = router;

