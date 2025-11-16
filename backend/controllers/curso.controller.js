const { query } = require('../config/db.config');

// Función para crear un nuevo curso
exports.crearCurso = async (req, res) => {
    const { nombre_curso, descripcion, turno } = req.body;

    try {
        // Validar datos requeridos
        if (!nombre_curso) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del curso es obligatorio'
            });
        }

        // Validar turno si se proporciona
        if (turno && !['Mañana', 'Tarde'].includes(turno)) {
            return res.status(400).json({
                success: false,
                message: 'El turno debe ser "Mañana" o "Tarde"'
            });
        }

        // Insertar curso en la base de datos
        const resultado = await query(
            `INSERT INTO Cursos (nombre_curso, descripcion, turno, activo) 
             VALUES ($1, $2, $3, true) 
             RETURNING id_curso, nombre_curso, descripcion, turno, activo, fecha_creacion`,
            [nombre_curso, descripcion || null, turno || null]
        );

        const nuevoCurso = resultado.rows[0];

        res.status(201).json({
            success: true,
            message: 'Curso creado exitosamente',
            data: {
                id_curso: nuevoCurso.id_curso,
                nombre_curso: nuevoCurso.nombre_curso,
                descripcion: nuevoCurso.descripcion,
                turno: nuevoCurso.turno,
                activo: nuevoCurso.activo,
                fecha_creacion: nuevoCurso.fecha_creacion
            }
        });

    } catch (error) {
        console.error('Error en crearCurso:', error);
        
        // Manejo de errores específicos de PostgreSQL
        if (error.code === '23503') { // Violación de restricción de clave foránea
            return res.status(400).json({
                success: false,
                message: 'El docente especificado no existe'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener todos los cursos
exports.obtenerCursos = async (req, res) => {
    try {
        const resultado = await query(`
            SELECT 
                c.id_curso,
                c.nombre_curso,
                c.descripcion,
                c.turno,
                c.activo,
                c.fecha_creacion,
                COUNT(DISTINCT cd.id_docente) as total_docentes,
                COUNT(m.id_matricula) as total_estudiantes
            FROM Cursos c
            LEFT JOIN Curso_Docente cd ON c.id_curso = cd.id_curso AND cd.activo = true
            LEFT JOIN Matricula m ON c.id_curso = m.id_curso AND m.estado = 'Activo'
            GROUP BY c.id_curso, c.nombre_curso, c.descripcion, c.turno, c.activo, c.fecha_creacion
            ORDER BY c.fecha_creacion DESC
        `);

        res.status(200).json({
            success: true,
            message: 'Cursos obtenidos exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerCursos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para asignar docente a un curso (DEPRECADA - usar /api/horarios/curso/:id_curso/docentes)
exports.asignarDocente = async (req, res) => {
    return res.status(410).json({
        success: false,
        message: 'Esta función está deprecada. Use /api/horarios/curso/:id_curso/docentes para asignar docentes'
    });
};

// Función para obtener cursos de un docente específico
exports.obtenerCursosPorDocente = async (req, res) => {
    const { id_docente } = req.params;

    try {
        const resultado = await query(`
            SELECT 
                c.id_curso,
                c.nombre_curso,
                c.descripcion,
                c.turno,
                c.activo,
                c.fecha_creacion,
                COUNT(m.id_matricula) as total_estudiantes,
                COUNT(CASE WHEN m.estado = 'Activo' THEN 1 END) as estudiantes_activos
            FROM Cursos c
            INNER JOIN Curso_Docente cd ON c.id_curso = cd.id_curso AND cd.activo = true
            LEFT JOIN Matricula m ON c.id_curso = m.id_curso
            WHERE cd.id_docente = $1 AND c.activo = true
            GROUP BY c.id_curso, c.nombre_curso, c.descripcion, c.turno, c.activo, c.fecha_creacion
            ORDER BY c.fecha_creacion DESC
        `, [id_docente]);

        res.status(200).json({
            success: true,
            message: 'Cursos del docente obtenidos exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerCursosPorDocente:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener estudiantes de un curso específico
exports.obtenerEstudiantesPorCurso = async (req, res) => {
    const { id_curso } = req.params;

    try {
        const resultado = await query(`
            SELECT 
                u.id_usuario,
                u.nombre,
                u.apellido,
                u.correo,
                m.fecha_matricula,
                m.estado as estado_matricula
            FROM Matricula m
            JOIN Usuarios u ON m.id_estudiante = u.id_usuario
            WHERE m.id_curso = $1 AND u.activo = true
            ORDER BY u.apellido, u.nombre
        `, [id_curso]);

        res.status(200).json({
            success: true,
            message: 'Estudiantes del curso obtenidos exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerEstudiantesPorCurso:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener estudiantes de un curso con sus padres
exports.obtenerEstudiantesConPadresPorCurso = async (req, res) => {
    const { id_curso } = req.params;

    try {
        const resultado = await query(`
            SELECT DISTINCT
                u.id_usuario as estudiante_id,
                u.nombre as estudiante_nombre,
                u.apellido as estudiante_apellido,
                u.correo as estudiante_correo,
                u.dni as estudiante_dni,
                p.id_usuario as padre_id,
                p.nombre as padre_nombre,
                p.apellido as padre_apellido,
                p.correo as padre_correo,
                rf.relacion
            FROM Matricula m
            JOIN Usuarios u ON m.id_estudiante = u.id_usuario
            LEFT JOIN Relacion_Familiar rf ON rf.id_estudiante = u.id_usuario AND rf.activo = true
            LEFT JOIN Usuarios p ON rf.id_padre = p.id_usuario
            WHERE m.id_curso = $1 
              AND m.estado = 'Activo'
              AND u.activo = true
              AND u.rol = 'Estudiante'
            ORDER BY u.apellido, u.nombre
        `, [id_curso]);

        // Agrupar estudiantes con sus padres
        const estudiantesMap = {};
        resultado.rows.forEach(row => {
            if (!estudiantesMap[row.estudiante_id]) {
                estudiantesMap[row.estudiante_id] = {
                    id_usuario: row.estudiante_id,
                    nombre: row.estudiante_nombre,
                    apellido: row.estudiante_apellido,
                    correo: row.estudiante_correo,
                    dni: row.estudiante_dni,
                    padres: []
                };
            }
            if (row.padre_id) {
                estudiantesMap[row.estudiante_id].padres.push({
                    id_usuario: row.padre_id,
                    nombre: row.padre_nombre,
                    apellido: row.padre_apellido,
                    correo: row.padre_correo,
                    relacion: row.relacion
                });
            }
        });

        const estudiantes = Object.values(estudiantesMap);

        res.status(200).json({
            success: true,
            message: 'Estudiantes con padres obtenidos exitosamente',
            data: estudiantes
        });

    } catch (error) {
        console.error('Error en obtenerEstudiantesConPadresPorCurso:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener un curso por ID
exports.obtenerCursoPorId = async (req, res) => {
    const { id_curso } = req.params;

    try {
        const resultado = await query(`
            SELECT 
                c.id_curso,
                c.nombre_curso,
                c.descripcion,
                c.turno,
                c.activo,
                c.fecha_creacion,
                COUNT(DISTINCT cd.id_docente) as total_docentes,
                COUNT(m.id_matricula) as total_estudiantes
            FROM Cursos c
            LEFT JOIN Curso_Docente cd ON c.id_curso = cd.id_curso AND cd.activo = true
            LEFT JOIN Matricula m ON c.id_curso = m.id_curso AND m.estado = 'Activo'
            WHERE c.id_curso = $1
            GROUP BY c.id_curso, c.nombre_curso, c.descripcion, c.turno, c.activo, c.fecha_creacion
        `, [id_curso]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Curso obtenido exitosamente',
            data: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en obtenerCursoPorId:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para actualizar un curso
exports.actualizarCurso = async (req, res) => {
    const { id_curso } = req.params;
    const { nombre_curso, descripcion, turno, activo } = req.body;

    try {
        // Verificar que el curso existe
        const cursoExiste = await query(
            'SELECT id_curso, nombre_curso FROM Cursos WHERE id_curso = $1',
            [id_curso]
        );

        if (cursoExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        // Validar turno si se proporciona
        if (turno !== undefined && turno !== null && !['Mañana', 'Tarde'].includes(turno)) {
            return res.status(400).json({
                success: false,
                message: 'El turno debe ser "Mañana" o "Tarde"'
            });
        }

        // Construir la consulta de actualización dinámicamente
        const campos = [];
        const valores = [];
        let contador = 1;

        if (nombre_curso !== undefined) {
            campos.push(`nombre_curso = $${contador++}`);
            valores.push(nombre_curso);
        }
        if (descripcion !== undefined) {
            campos.push(`descripcion = $${contador++}`);
            valores.push(descripcion);
        }
        if (turno !== undefined) {
            campos.push(`turno = $${contador++}`);
            valores.push(turno);
        }
        if (activo !== undefined) {
            campos.push(`activo = $${contador++}`);
            valores.push(activo);
        }

        if (campos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar'
            });
        }

        valores.push(id_curso);
        const querySQL = `UPDATE Cursos SET ${campos.join(', ')} WHERE id_curso = $${contador} RETURNING *`;
        
        const resultado = await query(querySQL, valores);
        const cursoActualizado = resultado.rows[0];

        res.status(200).json({
            success: true,
            message: 'Curso actualizado exitosamente',
            data: {
                id_curso: cursoActualizado.id_curso,
                nombre_curso: cursoActualizado.nombre_curso,
                descripcion: cursoActualizado.descripcion,
                turno: cursoActualizado.turno,
                activo: cursoActualizado.activo,
                fecha_creacion: cursoActualizado.fecha_creacion
            }
        });

    } catch (error) {
        console.error('Error en actualizarCurso:', error);
        
        // Manejo de errores específicos de PostgreSQL
        if (error.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'El docente especificado no existe'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};