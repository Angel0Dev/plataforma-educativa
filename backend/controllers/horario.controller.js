const { query } = require('../config/db.config');

// Obtener todos los docentes de un curso
exports.obtenerDocentesCurso = async (req, res) => {
    const { id_curso } = req.params;

    try {
        const resultado = await query(`
            SELECT 
                cd.id_curso_docente,
                cd.id_curso,
                cd.id_docente,
                cd.activo,
                cd.fecha_asignacion,
                u.nombre,
                u.apellido,
                u.correo,
                u.turno as docente_turno
            FROM Curso_Docente cd
            JOIN Usuarios u ON cd.id_docente = u.id_usuario
            WHERE cd.id_curso = $1 AND cd.activo = true
            ORDER BY u.apellido, u.nombre
        `, [id_curso]);

        res.status(200).json({
            success: true,
            message: 'Docentes del curso obtenidos exitosamente',
            data: resultado.rows
        });
    } catch (error) {
        console.error('Error en obtenerDocentesCurso:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Agregar un docente a un curso
exports.agregarDocenteCurso = async (req, res) => {
    const { id_curso } = req.params;
    const { id_docente } = req.body;

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

        // Verificar que el docente existe y es docente
        const docenteExiste = await query(
            'SELECT id_usuario, nombre, apellido FROM Usuarios WHERE id_usuario = $1 AND rol = $2 AND activo = true',
            [id_docente, 'Docente']
        );

        if (docenteExiste.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El docente especificado no existe o no tiene el rol correcto'
            });
        }

        // Verificar si ya está asignado
        const yaAsignado = await query(
            'SELECT id_curso_docente FROM Curso_Docente WHERE id_curso = $1 AND id_docente = $2',
            [id_curso, id_docente]
        );

        if (yaAsignado.rows.length > 0) {
            // Si ya existe pero está inactivo, activarlo
            await query(
                'UPDATE Curso_Docente SET activo = true, fecha_asignacion = CURRENT_TIMESTAMP WHERE id_curso = $1 AND id_docente = $2',
                [id_curso, id_docente]
            );
        } else {
            // Crear nueva asignación
            await query(
                'INSERT INTO Curso_Docente (id_curso, id_docente, activo) VALUES ($1, $2, true)',
                [id_curso, id_docente]
            );
        }

        res.status(201).json({
            success: true,
            message: `Docente ${docenteExiste.rows[0].nombre} ${docenteExiste.rows[0].apellido} agregado al curso exitosamente`
        });
    } catch (error) {
        console.error('Error en agregarDocenteCurso:', error);
        
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'El docente ya está asignado a este curso'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Eliminar un docente de un curso
exports.eliminarDocenteCurso = async (req, res) => {
    const { id_curso, id_docente } = req.params;

    try {
        const resultado = await query(
            'UPDATE Curso_Docente SET activo = false WHERE id_curso = $1 AND id_docente = $2 RETURNING *',
            [id_curso, id_docente]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Asignación de docente no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Docente eliminado del curso exitosamente'
        });
    } catch (error) {
        console.error('Error en eliminarDocenteCurso:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener horarios de un curso
exports.obtenerHorariosCurso = async (req, res) => {
    const { id_curso } = req.params;

    try {
        const resultado = await query(`
            SELECT 
                h.id_horario,
                h.id_curso,
                h.id_docente,
                h.id_salon,
                h.dia_semana,
                h.hora_inicio,
                h.hora_fin,
                h.turno,
                h.activo,
                u.nombre as docente_nombre,
                u.apellido as docente_apellido,
                s.nombre_salon,
                s.grado,
                s.seccion
            FROM Horarios h
            LEFT JOIN Usuarios u ON h.id_docente = u.id_usuario
            LEFT JOIN Salones s ON h.id_salon = s.id_salon
            WHERE h.id_curso = $1 AND h.activo = true
            ORDER BY 
                CASE h.dia_semana
                    WHEN 'Lunes' THEN 1
                    WHEN 'Martes' THEN 2
                    WHEN 'Miércoles' THEN 3
                    WHEN 'Jueves' THEN 4
                    WHEN 'Viernes' THEN 5
                END,
                h.hora_inicio
        `, [id_curso]);

        res.status(200).json({
            success: true,
            message: 'Horarios del curso obtenidos exitosamente',
            data: resultado.rows
        });
    } catch (error) {
        console.error('Error en obtenerHorariosCurso:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Crear un horario
exports.crearHorario = async (req, res) => {
    const { id_curso, id_docente, id_salon, dia_semana, hora_inicio, hora_fin, turno } = req.body;

    try {
        // Validaciones
        if (!id_curso || !id_docente || !dia_semana || !hora_inicio || !hora_fin) {
            return res.status(400).json({
                success: false,
                message: 'Curso, docente, día, hora inicio y hora fin son obligatorios'
            });
        }

        const diasValidos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
        if (!diasValidos.includes(dia_semana)) {
            return res.status(400).json({
                success: false,
                message: 'Día de la semana inválido'
            });
        }

        if (turno && !['Mañana', 'Tarde'].includes(turno)) {
            return res.status(400).json({
                success: false,
                message: 'Turno debe ser "Mañana" o "Tarde"'
            });
        }

        // Verificar que el docente está asignado al curso, si no, asignarlo automáticamente
        const docenteAsignado = await query(
            'SELECT id_curso_docente FROM Curso_Docente WHERE id_curso = $1 AND id_docente = $2',
            [id_curso, id_docente]
        );

        if (docenteAsignado.rows.length === 0) {
            // Asignar el docente al curso automáticamente
            await query(
                'INSERT INTO Curso_Docente (id_curso, id_docente, activo) VALUES ($1, $2, true)',
                [id_curso, id_docente]
            );
        } else if (!docenteAsignado.rows[0].activo) {
            // Si está asignado pero inactivo, reactivarlo
            await query(
                'UPDATE Curso_Docente SET activo = true, fecha_asignacion = CURRENT_TIMESTAMP WHERE id_curso = $1 AND id_docente = $2',
                [id_curso, id_docente]
            );
        }

        // Verificar que el salón existe si se proporciona
        if (id_salon) {
            const salonExiste = await query(
                'SELECT id_salon FROM Salones WHERE id_salon = $1 AND activo = true',
                [id_salon]
            );

            if (salonExiste.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El salón especificado no existe o está inactivo'
                });
            }
        }

        // Insertar horario
        const resultado = await query(`
            INSERT INTO Horarios (id_curso, id_docente, id_salon, dia_semana, hora_inicio, hora_fin, turno, activo)
            VALUES ($1, $2, $3, $4, $5, $6, $7, true)
            RETURNING *
        `, [id_curso, id_docente, id_salon || null, dia_semana, hora_inicio, hora_fin, turno || null]);

        res.status(201).json({
            success: true,
            message: 'Horario creado exitosamente',
            data: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error en crearHorario:', error);
        
        if (error.message.includes('conflicto')) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Actualizar un horario
exports.actualizarHorario = async (req, res) => {
    const { id_horario } = req.params;
    const { id_docente, id_salon, dia_semana, hora_inicio, hora_fin, turno, activo } = req.body;

    try {
        // Verificar que el horario existe
        const horarioExiste = await query(
            'SELECT id_horario, id_curso FROM Horarios WHERE id_horario = $1',
            [id_horario]
        );

        if (horarioExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Horario no encontrado'
            });
        }

        const id_curso = horarioExiste.rows[0].id_curso;

        // Validaciones
        if (dia_semana && !['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].includes(dia_semana)) {
            return res.status(400).json({
                success: false,
                message: 'Día de la semana inválido'
            });
        }

        if (turno !== undefined && turno !== null && !['Mañana', 'Tarde'].includes(turno)) {
            return res.status(400).json({
                success: false,
                message: 'Turno debe ser "Mañana" o "Tarde"'
            });
        }

        // Si se cambia el docente, verificar que está asignado al curso
        if (id_docente) {
            const docenteAsignado = await query(
                'SELECT id_curso_docente FROM Curso_Docente WHERE id_curso = $1 AND id_docente = $2 AND activo = true',
                [id_curso, id_docente]
            );

            if (docenteAsignado.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El docente no está asignado a este curso'
                });
            }
        }

        // Construir consulta de actualización
        const campos = [];
        const valores = [];
        let contador = 1;

        if (id_docente !== undefined) {
            campos.push(`id_docente = $${contador++}`);
            valores.push(id_docente);
        }
        if (id_salon !== undefined) {
            campos.push(`id_salon = $${contador++}`);
            valores.push(id_salon);
        }
        if (dia_semana !== undefined) {
            campos.push(`dia_semana = $${contador++}`);
            valores.push(dia_semana);
        }
        if (hora_inicio !== undefined) {
            campos.push(`hora_inicio = $${contador++}`);
            valores.push(hora_inicio);
        }
        if (hora_fin !== undefined) {
            campos.push(`hora_fin = $${contador++}`);
            valores.push(hora_fin);
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

        valores.push(id_horario);
        const querySQL = `UPDATE Horarios SET ${campos.join(', ')} WHERE id_horario = $${contador} RETURNING *`;
        
        const resultado = await query(querySQL, valores);

        res.status(200).json({
            success: true,
            message: 'Horario actualizado exitosamente',
            data: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error en actualizarHorario:', error);
        
        if (error.message.includes('conflicto')) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Eliminar un horario
exports.eliminarHorario = async (req, res) => {
    const { id_horario } = req.params;

    try {
        const resultado = await query(
            'UPDATE Horarios SET activo = false WHERE id_horario = $1 RETURNING *',
            [id_horario]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Horario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Horario eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error en eliminarHorario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

