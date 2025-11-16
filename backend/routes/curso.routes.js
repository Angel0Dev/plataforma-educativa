const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/curso.controller');

// Ruta para crear un nuevo curso
router.post('/', cursoController.crearCurso);

// Ruta para obtener todos los cursos
router.get('/', cursoController.obtenerCursos);

// Ruta para obtener cursos de un docente específico (debe estar antes de /:id_curso)
router.get('/docente/:id_docente', cursoController.obtenerCursosPorDocente);

// Ruta para asignar docente a un curso (debe estar antes de /:id_curso)
router.put('/:id_curso/asignar-docente', cursoController.asignarDocente);

// Rutas de tareas (deben estar antes de /:id_curso)
const tareaController = require('../controllers/tarea.controller');
router.get('/:id_curso/tareas', tareaController.obtenerTareasPorCurso);
router.post('/tareas', tareaController.crearTarea);

// Ruta para obtener estudiantes de un curso específico (debe estar antes de /:id_curso)
// IMPORTANTE: Las rutas más específicas deben estar ANTES de las menos específicas
router.get('/:id_curso/estudiantes-con-padres', (req, res, next) => {
    console.log('🔍 Ruta estudiantes-con-padres capturada, id_curso:', req.params.id_curso);
    next();
}, cursoController.obtenerEstudiantesConPadresPorCurso);
router.get('/:id_curso/estudiantes', cursoController.obtenerEstudiantesPorCurso);

// Ruta para actualizar un curso
router.put('/:id_curso', cursoController.actualizarCurso);

// Ruta para obtener un curso por ID (debe estar al final)
router.get('/:id_curso', cursoController.obtenerCursoPorId);

module.exports = router;
