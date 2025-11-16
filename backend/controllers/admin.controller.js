const { query } = require('../config/db.config');
const bcrypt = require('bcryptjs');
const { enviarCorreo } = require('../config/email.config');

// Función para obtener estadísticas generales del sistema
exports.obtenerEstadisticas = async (req, res) => {
    try {
        // Obtener total de usuarios por rol
        const usuariosPorRol = await query(`
            SELECT 
                rol,
                COUNT(*) as total,
                COUNT(CASE WHEN activo = true THEN 1 END) as activos
            FROM Usuarios 
            GROUP BY rol
        `);

        // Obtener total de cursos
        const cursosStats = await query(`
            SELECT 
                COUNT(*) as total_cursos,
                COUNT(CASE WHEN activo = true THEN 1 END) as cursos_activos,
                COUNT(CASE WHEN activo = false THEN 1 END) as cursos_inactivos
            FROM Cursos
        `);

        // Obtener total de matrículas
        const matriculasStats = await query(`
            SELECT 
                COUNT(*) as total_matriculas,
                COUNT(CASE WHEN estado = 'Activo' THEN 1 END) as matriculas_activas
            FROM Matricula
        `);

        // Obtener estadísticas de calificaciones
        const calificacionesStats = await query(`
            SELECT 
                COUNT(*) as total_entregas,
                AVG(calificacion) as promedio_general,
                COUNT(CASE WHEN calificacion >= 80 THEN 1 END) as entregas_excelentes,
                COUNT(CASE WHEN calificacion >= 60 AND calificacion < 80 THEN 1 END) as entregas_buenas,
                COUNT(CASE WHEN calificacion < 60 THEN 1 END) as entregas_regular
            FROM Entregas 
            WHERE calificacion IS NOT NULL
        `);

        // Obtener usuarios recientes (últimos 7 días)
        const usuariosRecientes = await query(`
            SELECT 
                id_usuario,
                nombre,
                apellido,
                correo,
                rol,
                fecha_creacion,
                activo
            FROM Usuarios 
            WHERE fecha_creacion >= CURRENT_DATE - INTERVAL '7 days'
            ORDER BY fecha_creacion DESC
            LIMIT 10
        `);

        // Obtener cursos activos con información de docentes
        const cursosActivos = await query(`
            SELECT 
                c.id_curso,
                c.nombre_curso,
                c.descripcion,
                c.turno,
                c.activo,
                COUNT(DISTINCT cd.id_docente) as total_docentes,
                COUNT(m.id_matricula) as total_estudiantes
            FROM Cursos c
            LEFT JOIN Curso_Docente cd ON c.id_curso = cd.id_curso AND cd.activo = true
            LEFT JOIN Matricula m ON c.id_curso = m.id_curso AND m.estado = 'Activo'
            GROUP BY c.id_curso, c.nombre_curso, c.descripcion, c.turno, c.activo
            ORDER BY c.nombre_curso
        `);

        // Obtener calificaciones recientes
        const calificacionesRecientes = await query(`
            SELECT 
                e.id_entrega,
                e.calificacion,
                e.fecha_entrega,
                u_est.nombre as estudiante_nombre,
                u_est.apellido as estudiante_apellido,
                c.nombre_curso,
                t.titulo as tarea_titulo
            FROM Entregas e
            JOIN Usuarios u_est ON e.id_estudiante = u_est.id_usuario
            JOIN Tareas t ON e.id_tarea = t.id_tarea
            JOIN Cursos c ON t.id_curso = c.id_curso
            WHERE e.calificacion IS NOT NULL
            ORDER BY e.fecha_entrega DESC
            LIMIT 10
        `);

        // Procesar datos de usuarios por rol
        const estadisticasUsuarios = {
            total: 0,
            estudiantes: 0,
            docentes: 0,
            padres: 0,
            activos: 0
        };

        usuariosPorRol.rows.forEach(row => {
            const total = Number(row.total) || 0;
            const activos = Number(row.activos) || 0;
            
            estadisticasUsuarios.total += total;
            estadisticasUsuarios.activos += activos;
            
            switch(row.rol) {
                case 'Estudiante':
                    estadisticasUsuarios.estudiantes = total;
                    break;
                case 'Docente':
                    estadisticasUsuarios.docentes = total;
                    break;
                case 'Padre':
                    estadisticasUsuarios.padres = total;
                    break;
            }
        });

        // Preparar respuesta
        const estadisticas = {
            usuarios: estadisticasUsuarios,
            cursos: {
                total: parseInt(cursosStats.rows[0].total_cursos),
                activos: parseInt(cursosStats.rows[0].cursos_activos),
                inactivos: parseInt(cursosStats.rows[0].cursos_inactivos)
            },
            matriculas: {
                total: parseInt(matriculasStats.rows[0].total_matriculas),
                activas: parseInt(matriculasStats.rows[0].matriculas_activas)
            },
            calificaciones: {
                total_entregas: parseInt(calificacionesStats.rows[0].total_entregas) || 0,
                promedio_general: parseFloat(calificacionesStats.rows[0].promedio_general) || 0,
                excelentes: parseInt(calificacionesStats.rows[0].entregas_excelentes) || 0,
                buenas: parseInt(calificacionesStats.rows[0].entregas_buenas) || 0,
                regulares: parseInt(calificacionesStats.rows[0].entregas_regular) || 0
            },
            usuarios_recientes: usuariosRecientes.rows,
            cursos_activos: cursosActivos.rows,
            calificaciones_recientes: calificacionesRecientes.rows
        };

        res.status(200).json({
            success: true,
            message: 'Estadísticas obtenidas exitosamente',
            data: estadisticas
        });

    } catch (error) {
        console.error('Error en obtenerEstadisticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener todos los usuarios con información detallada
exports.obtenerUsuariosCompletos = async (req, res) => {
    try {
        const resultado = await query(`
            SELECT 
                id_usuario,
                nombre,
                apellido,
                correo,
                rol,
                fecha_creacion,
                activo,
                CASE 
                    WHEN rol = 'Docente' THEN (
                        SELECT COUNT(*) 
                        FROM Curso_Docente cd
                        INNER JOIN Cursos c ON cd.id_curso = c.id_curso
                        WHERE cd.id_docente = Usuarios.id_usuario 
                        AND cd.activo = true 
                        AND c.activo = true
                    )
                    WHEN rol = 'Estudiante' THEN (
                        SELECT COUNT(*) 
                        FROM Matricula 
                        WHERE id_estudiante = Usuarios.id_usuario AND estado = 'Activo'
                    )
                    ELSE 0
                END as cursos_relacionados
            FROM Usuarios 
            ORDER BY fecha_creacion DESC
        `);

        res.status(200).json({
            success: true,
            message: 'Usuarios obtenidos exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerUsuariosCompletos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para crear un nuevo usuario (solo administradores)
exports.crearUsuario = async (req, res) => {
    const { nombre, apellido, correo, contrasena, rol, dni, telefono, direccion } = req.body;

    try {
        // Validar datos requeridos
        if (!nombre || !apellido || !correo || !contrasena || !rol) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        // Validar que el rol sea válido
        const rolesValidos = ['Docente', 'Estudiante', 'Padre', 'Administrador'];
        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({
                success: false,
                message: 'Rol inválido. Los roles válidos son: Docente, Estudiante, Padre, Administrador'
            });
        }

        // Validar DNI obligatorio para padres
        if (rol === 'Padre' && !dni) {
            return res.status(400).json({
                success: false,
                message: 'El DNI es obligatorio para padres de familia'
            });
        }

        // Verificar si el correo ya existe
        const usuarioExistente = await query(
            'SELECT id_usuario FROM Usuarios WHERE correo = $1',
            [correo]
        );

        if (usuarioExistente.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Verificar si el DNI ya existe (si se proporcionó)
        if (dni) {
            const dniExistente = await query(
                'SELECT id_usuario FROM Usuarios WHERE dni = $1',
                [dni]
            );

            if (dniExistente.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'El DNI ya está registrado'
                });
            }
        }

        // Hash de la contraseña
        const saltRounds = 12;
        const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);

        // Insertar usuario en la base de datos
        const resultado = await query(
            `INSERT INTO Usuarios (nombre, apellido, correo, contrasena, rol, dni, telefono, direccion) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING id_usuario, nombre, apellido, correo, rol, dni, telefono, direccion, fecha_creacion, activo`,
            [nombre, apellido, correo, contrasenaHash, rol, dni || null, telefono || null, direccion || null]
        );

        const nuevoUsuario = resultado.rows[0];

        res.status(201).json({
            success: true,
            message: `Usuario ${rol} creado exitosamente`,
            data: nuevoUsuario
        });

    } catch (error) {
        console.error('Error en crearUsuario:', error);
        
        // Manejo de errores específicos de PostgreSQL
        if (error.code === '23505') { // Violación de restricción única
            return res.status(409).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener estudiantes matriculados en un curso
exports.obtenerEstudiantesMatriculados = async (req, res) => {
    const { id_curso } = req.params;

    try {
        const resultado = await query(`
            SELECT 
                m.id_matricula,
                m.fecha_matricula,
                m.estado,
                u.id_usuario,
                u.nombre,
                u.apellido,
                u.correo,
                c.nombre_curso
            FROM Matricula m
            JOIN Usuarios u ON m.id_estudiante = u.id_usuario
            JOIN Cursos c ON m.id_curso = c.id_curso
            WHERE m.id_curso = $1
            ORDER BY u.apellido, u.nombre
        `, [id_curso]);

        res.status(200).json({
            success: true,
            message: 'Estudiantes matriculados obtenidos exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerEstudiantesMatriculados:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para cambiar el rol de un usuario
exports.cambiarRolUsuario = async (req, res) => {
    const { id } = req.params;
    const { nuevoRol } = req.body;

    try {
        // Validar que el nuevo rol sea válido
        const rolesValidos = ['Docente', 'Estudiante', 'Padre', 'Administrador'];
        if (!rolesValidos.includes(nuevoRol)) {
            return res.status(400).json({
                success: false,
                message: 'Rol inválido. Los roles válidos son: Docente, Estudiante, Padre, Administrador'
            });
        }

        // Verificar que el usuario existe
        const usuarioExistente = await query(
            'SELECT id_usuario, nombre, apellido, rol FROM Usuarios WHERE id_usuario = $1',
            [id]
        );

        if (usuarioExistente.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Actualizar el rol
        const resultado = await query(
            'UPDATE Usuarios SET rol = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_usuario = $2 RETURNING *',
            [nuevoRol, id]
        );

        res.status(200).json({
            success: true,
            message: `Rol del usuario ${usuarioExistente.rows[0].nombre} ${usuarioExistente.rows[0].apellido} cambiado a ${nuevoRol}`,
            data: {
                id_usuario: resultado.rows[0].id_usuario,
                nombre: resultado.rows[0].nombre,
                apellido: resultado.rows[0].apellido,
                rol: resultado.rows[0].rol
            }
        });

    } catch (error) {
        console.error('Error en cambiarRolUsuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para crear padre e hijo con asignación de salón (solo administradores)
exports.crearPadreEHijo = async (req, res) => {
    const { 
        // Datos del padre
        padre_nombre, 
        padre_apellido, 
        padre_correo, 
        padre_contrasena, 
        padre_dni, 
        padre_telefono, 
        padre_direccion,
        // Datos del hijo
        hijo_nombre, 
        hijo_apellido, 
        hijo_dni,
        // Asignación
        seccion,
        turno,
        id_salon,
        id_cursos, // Array de cursos
        relacion
    } = req.body;

    try {
        // Validar datos requeridos del padre
        if (!padre_nombre || !padre_apellido || !padre_correo || !padre_contrasena || !padre_dni) {
            return res.status(400).json({
                success: false,
                message: 'Todos los datos del padre son obligatorios (nombre, apellido, correo, contraseña, DNI)'
            });
        }

        // Validar datos requeridos del hijo
        if (!hijo_nombre || !hijo_apellido) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y apellido del hijo son obligatorios'
            });
        }

        // Verificar si el correo del padre ya existe
        const correoPadreExiste = await query(
            'SELECT id_usuario FROM Usuarios WHERE correo = $1',
            [padre_correo]
        );

        if (correoPadreExiste.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'El correo del padre ya está registrado'
            });
        }

        // Verificar si el DNI del padre ya existe
        const dniPadreExiste = await query(
            'SELECT id_usuario FROM Usuarios WHERE dni = $1',
            [padre_dni]
        );

        if (dniPadreExiste.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'El DNI del padre ya está registrado'
            });
        }

        // Verificar si el DNI del hijo ya existe (si se proporcionó)
        if (hijo_dni) {
            const dniHijoExiste = await query(
                'SELECT id_usuario FROM Usuarios WHERE dni = $1',
                [hijo_dni]
            );

            if (dniHijoExiste.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'El DNI del hijo ya está registrado'
                });
            }
        }

        // Verificar capacidad del salón y obtener información completa si se proporciona
        let turnoSalon = null;
        let salonInfoCompleta = null;
        if (id_salon) {
            const salonInfo = await query(`
                SELECT 
                    s.id_salon,
                    s.nombre_salon,
                    s.descripcion,
                    s.capacidad_maxima,
                    s.grado,
                    s.seccion,
                    s.anio_academico,
                    s.turno,
                    COUNT(m.id_matricula) FILTER (WHERE m.estado = 'Activo') as estudiantes_actuales
                FROM Salones s
                LEFT JOIN Matricula m ON s.id_salon = m.id_salon
                WHERE s.id_salon = $1 AND s.activo = true
                GROUP BY s.id_salon, s.nombre_salon, s.descripcion, s.capacidad_maxima, 
                         s.grado, s.seccion, s.anio_academico, s.turno
            `, [id_salon]);

            if (salonInfo.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'El salón especificado no existe o está inactivo'
                });
            }

            salonInfoCompleta = salonInfo.rows[0];
            const capacidad = parseInt(salonInfoCompleta.capacidad_maxima);
            const estudiantesActuales = parseInt(salonInfoCompleta.estudiantes_actuales || 0);
            turnoSalon = salonInfoCompleta.turno;

            // Validar que el salón coincida con la sección y turno especificados (si se proporcionaron)
            if (seccion && salonInfoCompleta.seccion) {
                if (salonInfoCompleta.seccion.toLowerCase() !== seccion.toLowerCase()) {
                    return res.status(400).json({
                        success: false,
                        message: `El salón seleccionado tiene sección "${salonInfoCompleta.seccion}" pero se especificó "${seccion}". Por favor, seleccione un salón con la sección correcta.`
                    });
                }
            }

            if (turno && salonInfoCompleta.turno) {
                if (salonInfoCompleta.turno !== turno) {
                    return res.status(400).json({
                        success: false,
                        message: `El salón seleccionado tiene turno "${salonInfoCompleta.turno}" pero se especificó "${turno}". Por favor, seleccione un salón con el turno correcto.`
                    });
                }
            }

            if (estudiantesActuales >= capacidad) {
                return res.status(400).json({
                    success: false,
                    message: `El salón ha alcanzado su capacidad máxima de ${capacidad} estudiantes`
                });
            }
        }

        // El turno se toma automáticamente del salón si se proporciona uno, o del parámetro si se especificó
        const turnoFinal = turnoSalon || turno;

        // Hash de contraseñas
        const saltRounds = 12;
        const contrasenaPadreHash = await bcrypt.hash(padre_contrasena, saltRounds);

        // Generar correo y contraseña para el hijo
        let correoHijo = `${hijo_nombre.toLowerCase().trim().replace(/\s+/g, '')}.${hijo_apellido.toLowerCase().trim().replace(/\s+/g, '')}@jma.com`;
        let correoHijoFinal = correoHijo;
        let contador = 1;

        while (true) {
            const correoExiste = await query(
                'SELECT id_usuario FROM Usuarios WHERE correo = $1',
                [correoHijoFinal]
            );

            if (correoExiste.rows.length === 0) {
                break;
            }

            correoHijoFinal = `${hijo_nombre.toLowerCase().trim().replace(/\s+/g, '')}.${hijo_apellido.toLowerCase().trim().replace(/\s+/g, '')}${contador}@jma.com`;
            contador++;
        }

        // Generar contraseña para el hijo
        const generarContrasena = () => {
            const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let contrasena = '';
            for (let i = 0; i < 8; i++) {
                contrasena += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
            }
            return contrasena;
        };

        const contrasenaHijo = generarContrasena();
        const contrasenaHijoHash = await bcrypt.hash(contrasenaHijo, saltRounds);

        // Crear padre (con turno si se proporciona)
        const padreResultado = await query(
            `INSERT INTO Usuarios (nombre, apellido, correo, contrasena, rol, dni, telefono, direccion, turno) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING id_usuario, nombre, apellido, correo, rol, dni, turno`,
            [padre_nombre, padre_apellido, padre_correo, contrasenaPadreHash, 'Padre', padre_dni, padre_telefono || null, padre_direccion || null, turnoFinal || null]
        );

        const nuevoPadre = padreResultado.rows[0];

        // Crear hijo (con turno si se proporciona)
        const hijoResultado = await query(
            `INSERT INTO Usuarios (nombre, apellido, correo, contrasena, rol, dni, turno) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id_usuario, nombre, apellido, correo, rol, dni, turno`,
            [hijo_nombre.trim(), hijo_apellido.trim(), correoHijoFinal, contrasenaHijoHash, 'Estudiante', hijo_dni || null, turnoFinal || null]
        );

        const nuevoHijo = hijoResultado.rows[0];

        // Vincular padre e hijo
        await query(
            `INSERT INTO Relacion_Familiar (id_padre, id_estudiante, relacion, activo)
             VALUES ($1, $2, $3, true)
             ON CONFLICT (id_padre, id_estudiante) 
             DO UPDATE SET relacion = $3, activo = true, fecha_relacion = CURRENT_TIMESTAMP`,
            [nuevoPadre.id_usuario, nuevoHijo.id_usuario, relacion || 'Padre']
        );

        // Matricular en salón y cursos si se proporcionan
        const cursosAsignados = [];
        if (id_cursos && Array.isArray(id_cursos) && id_cursos.length > 0) {
            // Validar que todos los cursos existen y están activos
            for (const idCurso of id_cursos) {
                const cursoExiste = await query(
                    'SELECT id_curso, nombre_curso FROM Cursos WHERE id_curso = $1 AND activo = true',
                    [idCurso]
                );

                if (cursoExiste.rows.length === 0) {
                    console.warn(`Curso con ID ${idCurso} no existe o está inactivo, se omitirá`);
                    continue;
                }

                // Crear matrícula para cada curso
                if (id_salon) {
                    await query(
                        'INSERT INTO Matricula (id_estudiante, id_curso, id_salon, fecha_matricula, estado) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)',
                        [nuevoHijo.id_usuario, idCurso, id_salon, 'Activo']
                    );
                } else {
                    // Si no hay salón, crear matrícula sin salón (id_salon puede ser NULL)
                    await query(
                        'INSERT INTO Matricula (id_estudiante, id_curso, fecha_matricula, estado) VALUES ($1, $2, CURRENT_TIMESTAMP, $3)',
                        [nuevoHijo.id_usuario, idCurso, 'Activo']
                    );
                }
                cursosAsignados.push({
                    id_curso: idCurso,
                    nombre_curso: cursoExiste.rows[0].nombre_curso
                });
            }
        }
        
        // Si se asignó turno, asegurar que el padre también lo tenga (el trigger debería hacerlo, pero lo hacemos explícitamente)
        if (turnoFinal) {
            await query(
                'UPDATE Usuarios SET turno = $1 WHERE id_usuario = $2 AND rol = $3',
                [turnoFinal, nuevoPadre.id_usuario, 'Padre']
            );
        }

        // Preparar información del salón para la respuesta
        const salonInfo = salonInfoCompleta ? {
            id_salon: salonInfoCompleta.id_salon,
            nombre_salon: salonInfoCompleta.nombre_salon,
            grado: salonInfoCompleta.grado,
            seccion: salonInfoCompleta.seccion,
            turno: salonInfoCompleta.turno,
            nombre_completo: `${salonInfoCompleta.nombre_salon}${salonInfoCompleta.grado && salonInfoCompleta.seccion ? ` - ${salonInfoCompleta.grado} ${salonInfoCompleta.seccion}` : ''}${salonInfoCompleta.turno ? ` (${salonInfoCompleta.turno})` : ''}`
        } : null;

        // Preparar respuesta
        const respuesta = {
            padre: {
                id_usuario: nuevoPadre.id_usuario,
                nombre: nuevoPadre.nombre,
                apellido: nuevoPadre.apellido,
                correo: nuevoPadre.correo,
                dni: nuevoPadre.dni
            },
            hijo: {
                id_usuario: nuevoHijo.id_usuario,
                nombre: nuevoHijo.nombre,
                apellido: nuevoHijo.apellido,
                correo: nuevoHijo.correo,
                dni: nuevoHijo.dni
            },
            credenciales_hijo: {
                correo: correoHijoFinal,
                contrasena: contrasenaHijo
            },
            asignacion: {
                salon: salonInfo,
                cursos: cursosAsignados,
                turno: turnoFinal || null
            }
        };

        // Enviar correo al padre con toda la información
        const contenidoCorreo = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
                    .section { margin-bottom: 20px; padding: 15px; background-color: white; border-radius: 5px; border-left: 4px solid #007bff; }
                    .section h3 { margin-top: 0; color: #007bff; }
                    .credentials { background-color: #fff3cd; padding: 15px; border-radius: 5px; border: 2px solid #ffc107; margin: 15px 0; }
                    .credentials strong { color: #856404; }
                    .info-item { margin: 10px 0; }
                    .info-label { font-weight: bold; color: #555; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Bienvenido a la Plataforma Educativa JMA</h1>
                    </div>
                    <div class="content">
                        <p>Estimado/a <strong>${nuevoPadre.nombre} ${nuevoPadre.apellido}</strong>,</p>
                        <p>Le informamos que se ha creado exitosamente su cuenta y la cuenta de su hijo/a <strong>${nuevoHijo.nombre} ${nuevoHijo.apellido}</strong> en nuestra plataforma educativa.</p>
                        
                        <div class="section">
                            <h3>📋 Información del Estudiante</h3>
                            <div class="info-item">
                                <span class="info-label">Nombre completo:</span> ${nuevoHijo.nombre} ${nuevoHijo.apellido}
                            </div>
                            ${nuevoHijo.dni ? `<div class="info-item"><span class="info-label">DNI:</span> ${nuevoHijo.dni}</div>` : ''}
                        </div>

                        <div class="credentials">
                            <h3 style="margin-top: 0; color: #856404;">🔐 Credenciales de Acceso del Estudiante</h3>
                            <div class="info-item">
                                <span class="info-label">Correo Electrónico:</span><br>
                                <strong style="font-size: 16px; color: #007bff;">${correoHijoFinal}</strong>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Contraseña:</span><br>
                                <strong style="font-size: 18px; color: #dc3545; letter-spacing: 2px;">${contrasenaHijo}</strong>
                            </div>
                            <p style="color: #856404; font-weight: bold; margin-top: 15px;">
                                ⚠️ IMPORTANTE: Guarde estas credenciales de forma segura. El estudiante las necesitará para iniciar sesión.
                            </p>
                        </div>

                        ${salonInfo ? `
                        <div class="section">
                            <h3>🏫 Información del Salón</h3>
                            <div class="info-item">
                                <span class="info-label">Salón:</span> ${salonInfo.nombre_completo}
                            </div>
                            ${salonInfo.grado && salonInfo.seccion ? `
                                <div class="info-item">
                                    <span class="info-label">Grado y Sección:</span> ${salonInfo.grado} ${salonInfo.seccion}
                                </div>
                            ` : ''}
                            ${salonInfo.turno ? `
                                <div class="info-item">
                                    <span class="info-label">Turno:</span> ${salonInfo.turno}
                                </div>
                            ` : ''}
                        </div>
                        ` : ''}

                        ${cursosAsignados.length > 0 ? `
                        <div class="section">
                            <h3>📚 Cursos Asignados</h3>
                            <ul style="margin-left: 20px;">
                                ${cursosAsignados.map(curso => `<li>${curso.nombre_curso}</li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}

                        <div class="section">
                            <h3>📧 Información de su Cuenta</h3>
                            <div class="info-item">
                                <span class="info-label">Correo:</span> ${nuevoPadre.correo}
                            </div>
                            <p>Puede iniciar sesión con su correo electrónico y la contraseña que proporcionó durante el registro.</p>
                        </div>

                        <p style="margin-top: 30px;">Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos.</p>
                        <p>Atentamente,<br><strong>Equipo de la Plataforma Educativa JMA</strong></p>
                    </div>
                    <div class="footer">
                        <p>Este es un correo automático, por favor no responda a este mensaje.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Enviar correo de forma asíncrona (no bloquea la respuesta)
        enviarCorreo(nuevoPadre.correo, 'Bienvenido a la Plataforma Educativa JMA - Credenciales de Acceso', contenidoCorreo)
            .then(result => {
                if (result.success) {
                    console.log('Correo enviado exitosamente al padre:', nuevoPadre.correo);
                } else {
                    console.error('Error al enviar correo al padre:', result.error);
                }
            })
            .catch(error => {
                console.error('Error al enviar correo:', error);
            });

        res.status(201).json({
            success: true,
            message: 'Padre e hijo creados exitosamente',
            data: respuesta
        });

    } catch (error) {
        console.error('Error en crearPadreEHijo:', error);
        
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un usuario con ese correo o DNI'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para eliminar un usuario (soft delete - desactivar)
exports.eliminarUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar que el usuario existe
        const usuarioExiste = await query(
            'SELECT id_usuario, nombre, apellido, rol FROM Usuarios WHERE id_usuario = $1',
            [id]
        );

        if (usuarioExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const usuario = usuarioExiste.rows[0];

        // No permitir eliminar administradores
        if (usuario.rol === 'Administrador') {
            return res.status(403).json({
                success: false,
                message: 'No se puede eliminar un usuario administrador'
            });
        }

        // Soft delete: desactivar el usuario
        const resultado = await query(
            'UPDATE Usuarios SET activo = false, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_usuario = $1 RETURNING id_usuario, nombre, apellido, activo',
            [id]
        );

        res.status(200).json({
            success: true,
            message: `Usuario ${usuario.nombre} ${usuario.apellido} eliminado (desactivado) exitosamente`,
            data: {
                id_usuario: resultado.rows[0].id_usuario,
                nombre: resultado.rows[0].nombre,
                apellido: resultado.rows[0].apellido,
                activo: resultado.rows[0].activo
            }
        });

    } catch (error) {
        console.error('Error en eliminarUsuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para ejecutar limpieza automática de usuarios inactivos
exports.ejecutarLimpiezaUsuariosInactivos = async (req, res) => {
    try {
        const resultado = await query('SELECT * FROM ejecutar_limpieza_usuarios_inactivos()');
        
        if (resultado.rows.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'Error al ejecutar la limpieza de usuarios inactivos'
            });
        }

        const resultadoLimpieza = resultado.rows[0].ejecutar_limpieza_usuarios_inactivos;

        res.status(200).json({
            success: true,
            message: 'Limpieza de usuarios inactivos ejecutada exitosamente',
            data: resultadoLimpieza
        });

    } catch (error) {
        console.error('Error en ejecutarLimpiezaUsuariosInactivos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para que el administrador actualice credenciales de cualquier usuario
exports.actualizarCredencialesUsuario = async (req, res) => {
    const { id_usuario, nuevo_correo, nueva_contrasena } = req.body;

    try {
        // Validar datos requeridos
        if (!id_usuario) {
            return res.status(400).json({
                success: false,
                message: 'ID del usuario es obligatorio'
            });
        }

        if (!nuevo_correo && !nueva_contrasena) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un nuevo correo o una nueva contraseña'
            });
        }

        // Verificar que el usuario existe
        const usuarioExiste = await query(
            'SELECT id_usuario, correo, nombre, apellido, rol FROM Usuarios WHERE id_usuario = $1',
            [id_usuario]
        );

        if (usuarioExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'El usuario no existe'
            });
        }

        // Validar formato de correo si se proporciona
        if (nuevo_correo) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(nuevo_correo)) {
                return res.status(400).json({
                    success: false,
                    message: 'El formato del correo electrónico no es válido'
                });
            }

            // Verificar que el nuevo correo no esté en uso por otro usuario
            const correoEnUso = await query(
                'SELECT id_usuario FROM Usuarios WHERE correo = $1 AND id_usuario != $2',
                [nuevo_correo.trim().toLowerCase(), id_usuario]
            );

            if (correoEnUso.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'El correo electrónico ya está en uso por otro usuario'
                });
            }
        }

        // Validar contraseña si se proporciona
        if (nueva_contrasena) {
            if (nueva_contrasena.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                });
            }
        }

        // Actualizar correo si se proporciona
        if (nuevo_correo) {
            await query(
                'UPDATE Usuarios SET correo = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_usuario = $2',
                [nuevo_correo.trim().toLowerCase(), id_usuario]
            );
        }

        // Actualizar contraseña si se proporciona
        if (nueva_contrasena) {
            const saltRounds = 12;
            const contrasenaHash = await bcrypt.hash(nueva_contrasena, saltRounds);
            await query(
                'UPDATE Usuarios SET contrasena = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_usuario = $2',
                [contrasenaHash, id_usuario]
            );
        }

        // Obtener los datos actualizados del usuario
        const usuarioActualizado = await query(
            'SELECT id_usuario, nombre, apellido, correo, rol FROM Usuarios WHERE id_usuario = $1',
            [id_usuario]
        );

        res.status(200).json({
            success: true,
            message: 'Credenciales actualizadas exitosamente',
            data: {
                usuario: usuarioActualizado.rows[0],
                actualizado: {
                    correo: nuevo_correo ? true : false,
                    contrasena: nueva_contrasena ? true : false
                }
            }
        });

    } catch (error) {
        console.error('Error en actualizarCredencialesUsuario:', error);
        
        // Manejo de errores específicos de PostgreSQL
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};