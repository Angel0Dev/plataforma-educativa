const { query } = require('../config/db.config');

// Crear una nueva tarea
exports.crearTarea = async (req, res) => {
    const { id_curso, titulo, descripcion, fecha_limite, puntos_maximos } = req.body;

    try {
        // Validar datos requeridos
        if (!id_curso || !titulo || !fecha_limite) {
            return res.status(400).json({
                success: false,
                message: 'El curso, título y fecha límite son obligatorios'
            });
        }

        // Verificar que el curso existe
        const cursoExiste = await query(
            'SELECT id_curso, nombre_curso FROM Cursos WHERE id_curso = $1 AND activo = true',
            [id_curso]
        );

        if (cursoExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado o inactivo'
            });
        }

        // Insertar tarea
        const resultado = await query(
            `INSERT INTO Tareas (id_curso, titulo, descripcion, fecha_limite, puntos_maximos, activa)
             VALUES ($1, $2, $3, $4, $5, true)
             RETURNING *`,
            [id_curso, titulo, descripcion || null, fecha_limite, puntos_maximos || 100]
        );

        res.status(201).json({
            success: true,
            message: 'Tarea creada exitosamente',
            data: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en crearTarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener tareas de un curso
exports.obtenerTareasPorCurso = async (req, res) => {
    const { id_curso } = req.params;

    try {
        const resultado = await query(
            `SELECT 
                t.id_tarea,
                t.id_curso,
                t.titulo,
                t.descripcion,
                t.fecha_limite,
                t.fecha_creacion,
                t.puntos_maximos,
                t.activa,
                c.nombre_curso
             FROM Tareas t
             JOIN Cursos c ON t.id_curso = c.id_curso
             WHERE t.id_curso = $1 AND t.activa = true
             ORDER BY t.fecha_limite ASC`,
            [id_curso]
        );

        res.status(200).json({
            success: true,
            message: 'Tareas obtenidas exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerTareasPorCurso:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener entregas de una tarea
exports.obtenerEntregasPorTarea = async (req, res) => {
    const { id_tarea } = req.params;

    try {
        const resultado = await query(
            `SELECT 
                e.id_entrega,
                e.id_tarea,
                e.id_estudiante,
                e.fecha_entrega,
                e.calificacion,
                e.feedback_docente,
                e.archivo_adjunto,
                e.estado,
                u.nombre as estudiante_nombre,
                u.apellido as estudiante_apellido,
                u.correo as estudiante_correo,
                t.titulo as tarea_titulo,
                t.puntos_maximos
             FROM Entregas e
             JOIN Usuarios u ON e.id_estudiante = u.id_usuario
             JOIN Tareas t ON e.id_tarea = t.id_tarea
             WHERE e.id_tarea = $1
             ORDER BY e.fecha_entrega DESC`,
            [id_tarea]
        );

        res.status(200).json({
            success: true,
            message: 'Entregas obtenidas exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerEntregasPorTarea:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Crear una entrega (para docentes que califican sin entrega previa)
exports.crearEntrega = async (req, res) => {
    const { id_tarea, id_estudiante, archivo_adjunto, comentario } = req.body;

    try {
        if (!id_tarea || !id_estudiante) {
            return res.status(400).json({
                success: false,
                message: 'El ID de tarea y estudiante son obligatorios'
            });
        }

        // Verificar si ya existe una entrega
        const entregaExistente = await query(
            'SELECT id_entrega FROM Entregas WHERE id_tarea = $1 AND id_estudiante = $2',
            [id_tarea, id_estudiante]
        );

        if (entregaExistente.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe una entrega para este estudiante y tarea'
            });
        }

        // Crear la entrega
        const resultado = await query(
            `INSERT INTO Entregas (id_tarea, id_estudiante, archivo_adjunto, comentario, estado)
             VALUES ($1, $2, $3, $4, 'Entregado')
             RETURNING *`,
            [id_tarea, id_estudiante, archivo_adjunto || null, comentario || null]
        );

        res.status(201).json({
            success: true,
            message: 'Entrega creada exitosamente',
            data: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en crearEntrega:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Calificar una entrega
exports.calificarEntrega = async (req, res) => {
    const { id_entrega } = req.params;
    const { calificacion, feedback_docente } = req.body;

    try {
        // Validar calificación
        if (calificacion === undefined || calificacion === null) {
            return res.status(400).json({
                success: false,
                message: 'La calificación es obligatoria'
            });
        }

        const calificacionNum = parseFloat(calificacion);
        if (isNaN(calificacionNum) || calificacionNum < 0 || calificacionNum > 20) {
            return res.status(400).json({
                success: false,
                message: 'La calificación debe ser un número entre 0 y 20'
            });
        }

        // Verificar que la entrega existe
        const entregaExiste = await query(
            'SELECT id_entrega, id_tarea, id_estudiante FROM Entregas WHERE id_entrega = $1',
            [id_entrega]
        );

        if (entregaExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Entrega no encontrada'
            });
        }

        // Actualizar la entrega
        const resultado = await query(
            `UPDATE Entregas 
             SET calificacion = $1, 
                 feedback_docente = $2,
                 estado = 'Calificado'
             WHERE id_entrega = $3
             RETURNING *`,
            [calificacionNum, feedback_docente || null, id_entrega]
        );

        res.status(200).json({
            success: true,
            message: 'Calificación actualizada exitosamente',
            data: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en calificarEntrega:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener todos los estudiantes de un curso con sus entregas para una tarea específica
exports.obtenerEstudiantesConEntregas = async (req, res) => {
    const { id_tarea } = req.params;

    try {
        // Primero obtener información de la tarea
        const tareaInfo = await query(
            `SELECT t.id_tarea, t.id_curso, t.titulo, t.fecha_limite, t.puntos_maximos, c.nombre_curso
             FROM Tareas t
             JOIN Cursos c ON t.id_curso = c.id_curso
             WHERE t.id_tarea = $1`,
            [id_tarea]
        );

        if (tareaInfo.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }

        const tarea = tareaInfo.rows[0];

        // Obtener todos los estudiantes matriculados en el curso con sus entregas
        const resultado = await query(
            `SELECT 
                u.id_usuario,
                u.nombre,
                u.apellido,
                u.correo,
                u.dni,
                m.id_matricula,
                e.id_entrega,
                e.fecha_entrega,
                e.calificacion,
                e.feedback_docente,
                e.archivo_adjunto,
                e.estado as estado_entrega,
                CASE 
                    WHEN e.id_entrega IS NOT NULL THEN 'Entregado'
                    ELSE 'Pendiente'
                END as estado
             FROM Matricula m
             JOIN Usuarios u ON m.id_estudiante = u.id_usuario
             LEFT JOIN Entregas e ON e.id_tarea = $1 AND e.id_estudiante = u.id_usuario
             WHERE m.id_curso = $2 
               AND m.estado = 'Activo'
               AND u.rol = 'Estudiante'
             ORDER BY u.apellido, u.nombre`,
            [id_tarea, tarea.id_curso]
        );

        res.status(200).json({
            success: true,
            message: 'Estudiantes con entregas obtenidos exitosamente',
            data: {
                tarea: tarea,
                estudiantes: resultado.rows
            }
        });

    } catch (error) {
        console.error('Error en obtenerEstudiantesConEntregas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener tareas de un estudiante
exports.obtenerTareasPorEstudiante = async (req, res) => {
    const { id_estudiante } = req.params;

    try {
        const resultado = await query(
            `SELECT 
                t.id_tarea,
                t.id_curso,
                t.titulo,
                t.descripcion,
                t.fecha_limite,
                t.fecha_creacion,
                t.puntos_maximos,
                c.nombre_curso,
                e.id_entrega,
                e.fecha_entrega,
                e.calificacion,
                e.feedback_docente,
                e.estado as estado_entrega,
                CASE 
                    WHEN e.id_entrega IS NOT NULL THEN 'Entregado'
                    WHEN t.fecha_limite < CURRENT_DATE THEN 'Vencido'
                    WHEN t.fecha_limite <= CURRENT_DATE + INTERVAL '3 days' THEN 'Próximo'
                    ELSE 'Pendiente'
                END as estado_tarea
             FROM Tareas t
             JOIN Cursos c ON t.id_curso = c.id_curso
             JOIN Matricula m ON c.id_curso = m.id_curso
             LEFT JOIN Entregas e ON t.id_tarea = e.id_tarea AND e.id_estudiante = $1
             WHERE m.id_estudiante = $1 
               AND m.estado = 'Activo'
               AND t.activa = true
             ORDER BY t.fecha_limite ASC`,
            [id_estudiante]
        );

        res.status(200).json({
            success: true,
            message: 'Tareas del estudiante obtenidas exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerTareasPorEstudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

