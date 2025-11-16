const { query } = require('../config/db.config');

// Función para obtener todas las matrículas
exports.obtenerMatriculas = async (req, res) => {
    try {
        const resultado = await query(`
            SELECT 
                m.id_matricula,
                m.id_estudiante,
                m.id_curso,
                m.id_salon,
                m.fecha_matricula,
                m.estado,
                u.nombre as estudiante_nombre,
                u.apellido as estudiante_apellido,
                u.correo as estudiante_correo,
                c.nombre_curso,
                c.descripcion as curso_descripcion,
                u_doc.nombre as docente_nombre,
                u_doc.apellido as docente_apellido,
                s.nombre_salon,
                s.grado,
                s.seccion
            FROM Matricula m
            JOIN Usuarios u ON m.id_estudiante = u.id_usuario
            JOIN Cursos c ON m.id_curso = c.id_curso
            LEFT JOIN Usuarios u_doc ON c.id_docente = u_doc.id_usuario
            LEFT JOIN Salones s ON m.id_salon = s.id_salon
            ORDER BY m.fecha_matricula DESC
        `);

        res.status(200).json({
            success: true,
            message: 'Matrículas obtenidas exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerMatriculas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para matricular un estudiante en un curso
exports.matricularEstudiante = async (req, res) => {
    const { id_estudiante, id_curso, id_salon } = req.body;

    try {
        // Validar datos requeridos
        if (!id_estudiante || !id_curso) {
            return res.status(400).json({
                success: false,
                message: 'ID del estudiante y ID del curso son obligatorios'
            });
        }

        // Verificar que el estudiante existe y tiene rol de Estudiante
        const estudianteExiste = await query(
            'SELECT id_usuario, nombre, apellido FROM Usuarios WHERE id_usuario = $1 AND rol = $2 AND activo = true',
            [id_estudiante, 'Estudiante']
        );

        if (estudianteExiste.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El estudiante no existe, no tiene rol de Estudiante o está inactivo'
            });
        }

        // Verificar que el curso existe y está activo
        const cursoExiste = await query(
            'SELECT id_curso, nombre_curso FROM Cursos WHERE id_curso = $1 AND activo = true',
            [id_curso]
        );

        if (cursoExiste.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El curso no existe o está inactivo'
            });
        }

        // Verificar si ya existe una matrícula activa
        const matriculaExistente = await query(
            'SELECT id_matricula FROM Matricula WHERE id_estudiante = $1 AND id_curso = $2 AND estado = $3',
            [id_estudiante, id_curso, 'Activo']
        );

        if (matriculaExistente.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El estudiante ya está matriculado en este curso'
            });
        }

        // Verificar capacidad del salón si se proporciona
        if (id_salon) {
            const salonInfo = await query(`
                SELECT 
                    capacidad_maxima,
                    COUNT(m.id_matricula) FILTER (WHERE m.estado = 'Activo') as estudiantes_actuales
                FROM Salones s
                LEFT JOIN Matricula m ON s.id_salon = m.id_salon
                WHERE s.id_salon = $1 AND s.activo = true
                GROUP BY s.id_salon, s.capacidad_maxima
            `, [id_salon]);

            if (salonInfo.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'El salón especificado no existe o está inactivo'
                });
            }

            const capacidad = parseInt(salonInfo.rows[0].capacidad_maxima);
            const estudiantesActuales = parseInt(salonInfo.rows[0].estudiantes_actuales || 0);

            if (estudiantesActuales >= capacidad) {
                return res.status(400).json({
                    success: false,
                    message: `El salón ha alcanzado su capacidad máxima de ${capacidad} estudiantes`
                });
            }
        }

        // Crear la matrícula
        const resultado = await query(
            'INSERT INTO Matricula (id_estudiante, id_curso, id_salon, fecha_matricula, estado) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4) RETURNING *',
            [id_estudiante, id_curso, id_salon || null, 'Activo']
        );

        const nuevaMatricula = resultado.rows[0];
        const estudiante = estudianteExiste.rows[0];
        const curso = cursoExiste.rows[0];

        res.status(201).json({
            success: true,
            message: 'Estudiante matriculado exitosamente',
            data: {
                id_matricula: nuevaMatricula.id_matricula,
                estudiante: {
                    id: estudiante.id_usuario,
                    nombre: estudiante.nombre,
                    apellido: estudiante.apellido
                },
                curso: {
                    id: curso.id_curso,
                    nombre: curso.nombre_curso
                },
                fecha_matricula: nuevaMatricula.fecha_matricula,
                estado: nuevaMatricula.estado
            }
        });

    } catch (error) {
        console.error('Error en matricularEstudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para actualizar el estado de una matrícula
exports.actualizarEstadoMatricula = async (req, res) => {
    const { id_matricula } = req.params;
    const { estado } = req.body;

    try {
        // Validar estado
        if (!estado || !['Activo', 'Inactivo', 'Suspendido'].includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'Estado debe ser: Activo, Inactivo o Suspendido'
            });
        }

        const resultado = await query(
            'UPDATE Matricula SET estado = $1 WHERE id_matricula = $2 RETURNING *',
            [estado, id_matricula]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Matrícula no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Estado de matrícula actualizado exitosamente',
            data: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en actualizarEstadoMatricula:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener estudiantes no matriculados en un curso específico
exports.obtenerEstudiantesNoMatriculados = async (req, res) => {
    const { id_curso } = req.params;

    try {
        const resultado = await query(`
            SELECT 
                u.id_usuario,
                u.nombre,
                u.apellido,
                u.correo,
                u.fecha_creacion
            FROM Usuarios u
            WHERE u.rol = 'Estudiante' 
            AND u.activo = true
            AND u.id_usuario NOT IN (
                SELECT m.id_estudiante 
                FROM Matricula m 
                WHERE m.id_curso = $1 AND m.estado = 'Activo'
            )
            ORDER BY u.apellido, u.nombre
        `, [id_curso]);

        res.status(200).json({
            success: true,
            message: 'Estudiantes no matriculados obtenidos exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerEstudiantesNoMatriculados:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener estadísticas de matrículas
exports.obtenerEstadisticasMatriculas = async (req, res) => {
    try {
        const [totalMatriculas, matriculasActivas, matriculasPorCurso, matriculasPorEstado] = await Promise.all([
            query('SELECT COUNT(*) as total FROM Matricula'),
            query("SELECT COUNT(*) as activas FROM Matricula WHERE estado = 'Activo'"),
            query(`
                SELECT 
                    c.nombre_curso,
                    COUNT(m.id_matricula) as total_estudiantes,
                    COUNT(CASE WHEN m.estado = 'Activo' THEN 1 END) as estudiantes_activos
                FROM Cursos c
                LEFT JOIN Matricula m ON c.id_curso = m.id_curso
                GROUP BY c.id_curso, c.nombre_curso
                ORDER BY total_estudiantes DESC
            `),
            query(`
                SELECT 
                    estado,
                    COUNT(*) as total
                FROM Matricula 
                GROUP BY estado
            `)
        ]);

        res.status(200).json({
            success: true,
            message: 'Estadísticas de matrículas obtenidas exitosamente',
            data: {
                total_matriculas: parseInt(totalMatriculas.rows[0].total),
                matriculas_activas: parseInt(matriculasActivas.rows[0].activas),
                matriculas_por_curso: matriculasPorCurso.rows,
                matriculas_por_estado: matriculasPorEstado.rows
            }
        });

    } catch (error) {
        console.error('Error en obtenerEstadisticasMatriculas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener matrículas de un estudiante específico
exports.obtenerMatriculasPorEstudiante = async (req, res) => {
    const { id_estudiante } = req.params;

    try {
        const resultado = await query(`
            SELECT 
                m.id_matricula,
                m.id_estudiante,
                m.id_curso,
                m.id_salon,
                m.fecha_matricula,
                m.estado,
                c.nombre_curso,
                c.descripcion as curso_descripcion,
                u_doc.nombre as docente_nombre,
                u_doc.apellido as docente_apellido,
                s.nombre_salon,
                s.grado,
                s.seccion
            FROM Matricula m
            JOIN Cursos c ON m.id_curso = c.id_curso
            LEFT JOIN Usuarios u_doc ON c.id_docente = u_doc.id_usuario
            LEFT JOIN Salones s ON m.id_salon = s.id_salon
            WHERE m.id_estudiante = $1
            ORDER BY m.fecha_matricula DESC
        `, [id_estudiante]);

        res.status(200).json({
            success: true,
            message: 'Matrículas del estudiante obtenidas exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerMatriculasPorEstudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

