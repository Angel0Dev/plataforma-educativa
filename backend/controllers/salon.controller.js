const { query } = require('../config/db.config');

// Función para obtener todos los salones
exports.obtenerSalones = async (req, res) => {
    try {
        const resultado = await query(`
            SELECT 
                s.id_salon,
                s.nombre_salon,
                s.descripcion,
                s.capacidad_maxima,
                s.grado,
                s.seccion,
                s.anio_academico,
                s.turno,
                s.activo,
                s.id_docente_titular,
                u.nombre as docente_nombre,
                u.apellido as docente_apellido,
                COUNT(m.id_matricula) FILTER (WHERE m.estado = 'Activo') as estudiantes_matriculados,
                s.capacidad_maxima - COUNT(m.id_matricula) FILTER (WHERE m.estado = 'Activo') as cupos_disponibles
            FROM Salones s
            LEFT JOIN Usuarios u ON s.id_docente_titular = u.id_usuario
            LEFT JOIN Matricula m ON s.id_salon = m.id_salon
            GROUP BY s.id_salon, s.nombre_salon, s.descripcion, s.capacidad_maxima, 
                     s.grado, s.seccion, s.anio_academico, s.turno, s.activo, s.id_docente_titular,
                     u.nombre, u.apellido
            ORDER BY s.grado, s.seccion, s.nombre_salon
        `);

        res.status(200).json({
            success: true,
            message: 'Salones obtenidos exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerSalones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener un salón por ID con estudiantes
exports.obtenerSalonPorId = async (req, res) => {
    const { id } = req.params;

    try {
        // Obtener información del salón
        const salonInfo = await query(`
            SELECT 
                s.*,
                u.nombre as docente_nombre,
                u.apellido as docente_apellido,
                u.correo as docente_correo,
                COUNT(m.id_matricula) FILTER (WHERE m.estado = 'Activo') as estudiantes_matriculados
            FROM Salones s
            LEFT JOIN Usuarios u ON s.id_docente_titular = u.id_usuario
            LEFT JOIN Matricula m ON s.id_salon = m.id_salon AND m.estado = 'Activo'
            WHERE s.id_salon = $1
            GROUP BY s.id_salon, s.nombre_salon, s.descripcion, s.capacidad_maxima, s.grado, s.seccion, 
                     s.anio_academico, s.turno, s.activo, s.id_docente_titular, s.fecha_creacion, 
                     u.nombre, u.apellido, u.correo
        `, [id]);

        if (salonInfo.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Salón no encontrado'
            });
        }

        // Obtener estudiantes del salón
        const estudiantes = await query(`
            SELECT 
                u.id_usuario,
                u.nombre,
                u.apellido,
                u.correo,
                u.dni,
                m.id_matricula,
                m.fecha_matricula,
                m.estado
            FROM Matricula m
            JOIN Usuarios u ON m.id_estudiante = u.id_usuario
            WHERE m.id_salon = $1 AND m.estado = 'Activo'
            ORDER BY u.apellido, u.nombre
        `, [id]);

        res.status(200).json({
            success: true,
            message: 'Salón obtenido exitosamente',
            data: {
                salon: salonInfo.rows[0],
                estudiantes: estudiantes.rows
            }
        });

    } catch (error) {
        console.error('Error en obtenerSalonPorId:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para crear un nuevo salón
exports.crearSalon = async (req, res) => {
    const { nombre_salon, descripcion, capacidad_maxima, id_docente_titular, grado, seccion, anio_academico, turno } = req.body;

    try {
        // Validar datos requeridos
        if (!nombre_salon) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del salón es obligatorio'
            });
        }

        // Validar capacidad máxima
        const capacidad = capacidad_maxima || 40;
        if (capacidad <= 0 || capacidad > 100) {
            return res.status(400).json({
                success: false,
                message: 'La capacidad máxima debe estar entre 1 y 100'
            });
        }

        // Nota: Los nombres de salón pueden repetirse, no se valida duplicados

        // Verificar que el docente existe si se proporciona
        if (id_docente_titular) {
            const docenteExiste = await query(
                'SELECT id_usuario FROM Usuarios WHERE id_usuario = $1 AND rol = $2',
                [id_docente_titular, 'Docente']
            );

            if (docenteExiste.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'El docente especificado no existe o no tiene el rol correcto'
                });
            }
        }

        // Validar turno si se proporciona
        if (turno && !['Mañana', 'Tarde'].includes(turno)) {
            return res.status(400).json({
                success: false,
                message: 'El turno debe ser "Mañana" o "Tarde"'
            });
        }

        // Insertar salón
        const resultado = await query(`
            INSERT INTO Salones (nombre_salon, descripcion, capacidad_maxima, id_docente_titular, grado, seccion, anio_academico, turno)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [nombre_salon, descripcion || null, capacidad, id_docente_titular || null, grado || null, seccion || null, anio_academico || null, turno || null]);

        res.status(201).json({
            success: true,
            message: 'Salón creado exitosamente',
            data: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en crearSalon:', error);
        
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un salón con ese nombre'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para actualizar un salón
exports.actualizarSalon = async (req, res) => {
    const { id } = req.params;
    const { nombre_salon, descripcion, capacidad_maxima, id_docente_titular, grado, seccion, anio_academico, turno, activo } = req.body;

    try {
        // Verificar que el salón existe
        const salonExiste = await query(
            'SELECT id_salon FROM Salones WHERE id_salon = $1',
            [id]
        );

        if (salonExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Salón no encontrado'
            });
        }

        // Verificar capacidad si se actualiza
        if (capacidad_maxima) {
            // Contar estudiantes actuales
            const estudiantesActuales = await query(
                'SELECT COUNT(*) as total FROM Matricula WHERE id_salon = $1 AND estado = $2',
                [id, 'Activo']
            );

            const total = parseInt(estudiantesActuales.rows[0].total);
            if (capacidad_maxima < total) {
                return res.status(400).json({
                    success: false,
                    message: `No se puede reducir la capacidad a ${capacidad_maxima}. Actualmente hay ${total} estudiantes matriculados.`
                });
            }
        }

        // Construir query de actualización dinámicamente
        const campos = [];
        const valores = [];
        let contador = 1;

        if (nombre_salon !== undefined) {
            campos.push(`nombre_salon = $${contador++}`);
            valores.push(nombre_salon);
        }
        if (descripcion !== undefined) {
            campos.push(`descripcion = $${contador++}`);
            valores.push(descripcion);
        }
        if (capacidad_maxima !== undefined) {
            campos.push(`capacidad_maxima = $${contador++}`);
            valores.push(capacidad_maxima);
        }
        if (id_docente_titular !== undefined) {
            campos.push(`id_docente_titular = $${contador++}`);
            valores.push(id_docente_titular);
        }
        if (grado !== undefined) {
            campos.push(`grado = $${contador++}`);
            valores.push(grado);
        }
        if (seccion !== undefined) {
            campos.push(`seccion = $${contador++}`);
            valores.push(seccion);
        }
        if (anio_academico !== undefined) {
            campos.push(`anio_academico = $${contador++}`);
            valores.push(anio_academico);
        }
        if (turno !== undefined) {
            if (turno && !['Mañana', 'Tarde'].includes(turno)) {
                return res.status(400).json({
                    success: false,
                    message: 'El turno debe ser "Mañana" o "Tarde"'
                });
            }
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

        valores.push(id);
        const querySQL = `UPDATE Salones SET ${campos.join(', ')} WHERE id_salon = $${contador} RETURNING *`;
        
        const resultado = await query(querySQL, valores);

        res.status(200).json({
            success: true,
            message: 'Salón actualizado exitosamente',
            data: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en actualizarSalon:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para eliminar un salón (soft delete)
exports.eliminarSalon = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar que el salón existe
        const salonExiste = await query(
            'SELECT id_salon FROM Salones WHERE id_salon = $1',
            [id]
        );

        if (salonExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Salón no encontrado'
            });
        }

        // Soft delete: marcar como inactivo
        await query(
            'UPDATE Salones SET activo = false WHERE id_salon = $1',
            [id]
        );

        res.status(200).json({
            success: true,
            message: 'Salón eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error en eliminarSalon:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener estudiantes de un salón con sus padres
exports.obtenerEstudiantesConPadres = async (req, res) => {
    const { id_salon } = req.params;

    try {
        const resultado = await query(`
            SELECT 
                e.id_usuario as estudiante_id,
                e.nombre as estudiante_nombre,
                e.apellido as estudiante_apellido,
                e.correo as estudiante_correo,
                e.dni as estudiante_dni,
                e.turno as estudiante_turno,
                m.id_matricula,
                m.fecha_matricula,
                m.estado as estado_matricula,
                p.id_usuario as padre_id,
                p.nombre as padre_nombre,
                p.apellido as padre_apellido,
                p.correo as padre_correo,
                p.dni as padre_dni,
                p.telefono as padre_telefono,
                p.direccion as padre_direccion,
                p.turno as padre_turno,
                rf.relacion
            FROM Matricula m
            JOIN Usuarios e ON m.id_estudiante = e.id_usuario
            LEFT JOIN Relacion_Familiar rf ON e.id_usuario = rf.id_estudiante AND rf.activo = true
            LEFT JOIN Usuarios p ON rf.id_padre = p.id_usuario
            WHERE m.id_salon = $1 AND m.estado = 'Activo'
            ORDER BY e.apellido, e.nombre
        `, [id_salon]);

        // Agrupar por estudiante y sus padres
        const estudiantesMap = new Map();
        
        resultado.rows.forEach(row => {
            const estudianteId = row.estudiante_id;
            
            if (!estudiantesMap.has(estudianteId)) {
                estudiantesMap.set(estudianteId, {
                    estudiante: {
                        id_usuario: row.estudiante_id,
                        nombre: row.estudiante_nombre,
                        apellido: row.estudiante_apellido,
                        correo: row.estudiante_correo,
                        dni: row.estudiante_dni,
                        turno: row.estudiante_turno
                    },
                    matricula: {
                        id_matricula: row.id_matricula,
                        fecha_matricula: row.fecha_matricula,
                        estado: row.estado_matricula
                    },
                    padres: []
                });
            }
            
            // Agregar padre si existe y no está duplicado
            if (row.padre_id) {
                const estudianteData = estudiantesMap.get(estudianteId);
                const padreExiste = estudianteData.padres.some(p => p.id_usuario === row.padre_id);
                
                if (!padreExiste) {
                    estudianteData.padres.push({
                        id_usuario: row.padre_id,
                        nombre: row.padre_nombre,
                        apellido: row.padre_apellido,
                        correo: row.padre_correo,
                        dni: row.padre_dni,
                        telefono: row.padre_telefono,
                        direccion: row.padre_direccion,
                        turno: row.padre_turno,
                        relacion: row.relacion
                    });
                }
            }
        });

        const estudiantes = Array.from(estudiantesMap.values());

        res.status(200).json({
            success: true,
            message: 'Estudiantes con padres obtenidos exitosamente',
            data: estudiantes
        });

    } catch (error) {
        console.error('Error en obtenerEstudiantesConPadres:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener salones de un docente
exports.obtenerSalonesPorDocente = async (req, res) => {
    const { id_docente } = req.params;

    try {
        const resultado = await query(`
            SELECT 
                s.*,
                COUNT(m.id_matricula) FILTER (WHERE m.estado = 'Activo') as estudiantes_matriculados,
                s.capacidad_maxima - COUNT(m.id_matricula) FILTER (WHERE m.estado = 'Activo') as cupos_disponibles
            FROM Salones s
            LEFT JOIN Matricula m ON s.id_salon = m.id_salon
            WHERE s.id_docente_titular = $1 AND s.activo = true
            GROUP BY s.id_salon
            ORDER BY s.grado, s.seccion, s.nombre_salon
        `, [id_docente]);

        res.status(200).json({
            success: true,
            message: 'Salones del docente obtenidos exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerSalonesPorDocente:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

