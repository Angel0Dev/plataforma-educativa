const bcrypt = require('bcryptjs');
const { query } = require('../config/db.config');

// Función para registrar un nuevo usuario
exports.registrarUsuario = async (req, res) => {
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
        const rolesValidos = ['Docente', 'Estudiante', 'Padre'];
        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({
                success: false,
                message: 'Rol inválido. Los roles válidos son: Docente, Estudiante, Padre'
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
             RETURNING id_usuario, nombre, apellido, correo, rol, dni, telefono, direccion`,
            [nombre, apellido, correo, contrasenaHash, rol, dni || null, telefono || null, direccion || null]
        );

        const nuevoUsuario = resultado.rows[0];

        // Respuesta exitosa (sin incluir la contraseña)
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                id_usuario: nuevoUsuario.id_usuario,
                nombre: nuevoUsuario.nombre,
                apellido: nuevoUsuario.apellido,
                correo: nuevoUsuario.correo,
                rol: nuevoUsuario.rol,
                dni: nuevoUsuario.dni,
                telefono: nuevoUsuario.telefono,
                direccion: nuevoUsuario.direccion
            }
        });

    } catch (error) {
        console.error('Error en registrarUsuario:', error);
        
        // Manejo de errores específicos de PostgreSQL
        if (error.code === '23505') { // Violación de restricción única
            if (error.constraint && error.constraint.includes('dni')) {
                return res.status(409).json({
                    success: false,
                    message: 'El DNI ya está registrado'
                });
            }
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

// Función para obtener todos los usuarios (para administración)
exports.obtenerUsuarios = async (req, res) => {
    try {
        const resultado = await query(
            'SELECT id_usuario, nombre, apellido, correo, rol, dni, telefono, direccion FROM Usuarios ORDER BY nombre'
        );

        res.status(200).json({
            success: true,
            message: 'Usuarios obtenidos exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerUsuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener un usuario por ID
exports.obtenerUsuarioPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await query(
            'SELECT id_usuario, nombre, apellido, correo, rol, dni, telefono, direccion FROM Usuarios WHERE id_usuario = $1',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Usuario obtenido exitosamente',
            data: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en obtenerUsuarioPorId:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para vincular un padre con un estudiante
exports.vincularPadreEstudiante = async (req, res) => {
    const { id_padre, id_estudiante, relacion } = req.body;

    try {
        // Validar datos requeridos
        if (!id_padre || !id_estudiante) {
            return res.status(400).json({
                success: false,
                message: 'ID del padre e ID del estudiante son obligatorios'
            });
        }

        // Verificar que el padre existe y es un padre
        const padre = await query(
            'SELECT id_usuario, rol FROM Usuarios WHERE id_usuario = $1 AND rol = $2',
            [id_padre, 'Padre']
        );

        if (padre.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'El usuario padre no existe o no tiene el rol correcto'
            });
        }

        // Verificar que el estudiante existe y es un estudiante
        const estudiante = await query(
            'SELECT id_usuario, rol FROM Usuarios WHERE id_usuario = $1 AND rol = $2',
            [id_estudiante, 'Estudiante']
        );

        if (estudiante.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'El usuario estudiante no existe o no tiene el rol correcto'
            });
        }

        // Insertar o actualizar la relación familiar
        // Validar que la relación sea uno de los valores permitidos: 'Padre', 'Madre', 'Tutor', 'Representante'
        const relacionesPermitidas = ['Padre', 'Madre', 'Tutor', 'Representante'];
        const relacionFinal = relacion && relacionesPermitidas.includes(relacion) ? relacion : 'Padre';
        
        const resultado = await query(
            `INSERT INTO Relacion_Familiar (id_padre, id_estudiante, relacion, activo)
             VALUES ($1, $2, $3, true)
             ON CONFLICT (id_padre, id_estudiante) 
             DO UPDATE SET relacion = EXCLUDED.relacion, activo = true, fecha_relacion = CURRENT_TIMESTAMP
             RETURNING *`,
            [id_padre, id_estudiante, relacionFinal]
        );

        res.status(201).json({
            success: true,
            message: 'Relación padre-estudiante vinculada exitosamente',
            data: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en vincularPadreEstudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener información del padre de un estudiante
exports.obtenerPadreEstudiante = async (req, res) => {
    const { id_estudiante } = req.params;

    try {
        const resultado = await query(
            `SELECT 
                u.id_usuario,
                u.nombre,
                u.apellido,
                u.dni,
                u.correo,
                u.telefono,
                u.direccion,
                rf.relacion,
                rf.fecha_relacion
            FROM Relacion_Familiar rf
            JOIN Usuarios u ON rf.id_padre = u.id_usuario
            WHERE rf.id_estudiante = $1 AND rf.activo = true
            ORDER BY rf.fecha_relacion DESC`,
            [id_estudiante]
        );

        res.status(200).json({
            success: true,
            message: 'Información del padre obtenida exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerPadreEstudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener los hijos de un padre
exports.obtenerHijosPadre = async (req, res) => {
    const { id_padre } = req.params;

    try {
        const resultado = await query(
            `SELECT 
                u.id_usuario as id_estudiante,
                u.nombre,
                u.apellido,
                u.dni,
                u.correo,
                rf.relacion,
                rf.fecha_relacion
            FROM Relacion_Familiar rf
            JOIN Usuarios u ON rf.id_estudiante = u.id_usuario
            WHERE rf.id_padre = $1 AND rf.activo = true
            ORDER BY rf.fecha_relacion DESC`,
            [id_padre]
        );

        res.status(200).json({
            success: true,
            message: 'Hijos obtenidos exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerHijosPadre:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para que un padre registre a su hijo (genera correo y contraseña automáticamente)
exports.registrarHijoPorPadre = async (req, res) => {
    const { id_padre, nombre, apellido, dni, cursos } = req.body; // cursos es un array opcional de IDs de cursos

    try {
        // Validar datos requeridos
        if (!id_padre || !nombre || !apellido) {
            return res.status(400).json({
                success: false,
                message: 'ID del padre, nombre y apellido son obligatorios'
            });
        }

        // Verificar que el padre existe y tiene rol de Padre
        const padreExiste = await query(
            'SELECT id_usuario, nombre, apellido, dni FROM Usuarios WHERE id_usuario = $1 AND rol = $2 AND activo = true',
            [id_padre, 'Padre']
        );

        if (padreExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'El usuario padre no existe o no tiene el rol correcto'
            });
        }

        // Generar correo automático: nombre.apellido@jma.com
        // Si el correo ya existe, agregar un número
        let correoBase = `${nombre.toLowerCase().trim().replace(/\s+/g, '')}.${apellido.toLowerCase().trim().replace(/\s+/g, '')}@jma.com`;
        let correoFinal = correoBase;
        let contador = 1;

        // Verificar si el correo ya existe y generar uno único
        while (true) {
            const correoExiste = await query(
                'SELECT id_usuario FROM Usuarios WHERE correo = $1',
                [correoFinal]
            );

            if (correoExiste.rows.length === 0) {
                break; // Correo disponible
            }

            correoFinal = `${nombre.toLowerCase().trim().replace(/\s+/g, '')}.${apellido.toLowerCase().trim().replace(/\s+/g, '')}${contador}@jma.com`;
            contador++;
        }

        // Generar contraseña automática (8 caracteres alfanuméricos)
        const generarContrasena = () => {
            const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let contrasena = '';
            for (let i = 0; i < 8; i++) {
                contrasena += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
            }
            return contrasena;
        };

        const contrasenaGenerada = generarContrasena();

        // Hash de la contraseña
        const saltRounds = 12;
        const contrasenaHash = await bcrypt.hash(contrasenaGenerada, saltRounds);

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

        // Insertar estudiante en la base de datos
        const resultado = await query(
            `INSERT INTO Usuarios (nombre, apellido, correo, contrasena, rol, dni) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id_usuario, nombre, apellido, correo, rol, dni`,
            [nombre.trim(), apellido.trim(), correoFinal, contrasenaHash, 'Estudiante', dni || null]
        );

        const nuevoEstudiante = resultado.rows[0];

        // Vincular automáticamente al padre
        // Usar 'Padre' como valor por defecto (valores permitidos: 'Padre', 'Madre', 'Tutor', 'Representante')
        await query(
            `INSERT INTO Relacion_Familiar (id_padre, id_estudiante, relacion, activo)
             VALUES ($1, $2, 'Padre', true)
             ON CONFLICT (id_padre, id_estudiante) 
             DO UPDATE SET relacion = 'Padre', activo = true, fecha_relacion = CURRENT_TIMESTAMP`,
            [id_padre, nuevoEstudiante.id_usuario]
        );

        // Matricular en cursos si se proporcionaron
        const matriculasCreadas = [];
        if (cursos && Array.isArray(cursos) && cursos.length > 0) {
            for (const idCurso of cursos) {
                try {
                    // Verificar que el curso existe
                    const cursoExiste = await query(
                        'SELECT id_curso, nombre_curso FROM Cursos WHERE id_curso = $1 AND activo = true',
                        [idCurso]
                    );

                    if (cursoExiste.rows.length > 0) {
                        // Verificar si ya está matriculado
                        const matriculaExistente = await query(
                            'SELECT id_matricula FROM Matricula WHERE id_estudiante = $1 AND id_curso = $2 AND estado = $3',
                            [nuevoEstudiante.id_usuario, idCurso, 'Activo']
                        );

                        if (matriculaExistente.rows.length === 0) {
                            await query(
                                'INSERT INTO Matricula (id_estudiante, id_curso, fecha_matricula, estado) VALUES ($1, $2, CURRENT_TIMESTAMP, $3)',
                                [nuevoEstudiante.id_usuario, idCurso, 'Activo']
                            );
                            matriculasCreadas.push(cursoExiste.rows[0].nombre_curso);
                        }
                    }
                } catch (error) {
                    console.error(`Error al matricular en curso ${idCurso}:`, error);
                }
            }
        }

        res.status(201).json({
            success: true,
            message: 'Hijo registrado exitosamente',
            data: {
                estudiante: {
                    id_usuario: nuevoEstudiante.id_usuario,
                    nombre: nuevoEstudiante.nombre,
                    apellido: nuevoEstudiante.apellido,
                    correo: nuevoEstudiante.correo,
                    dni: nuevoEstudiante.dni,
                    rol: nuevoEstudiante.rol
                },
                credenciales: {
                    correo: correoFinal,
                    contrasena: contrasenaGenerada
                },
                cursos_matriculados: matriculasCreadas
            }
        });

    } catch (error) {
        console.error('Error en registrarHijoPorPadre:', error);
        
        // Manejo de errores específicos de PostgreSQL
        if (error.code === '23505') { // Violación de restricción única
            if (error.constraint && error.constraint.includes('dni')) {
                return res.status(409).json({
                    success: false,
                    message: 'El DNI ya está registrado'
                });
            }
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

// Función para obtener las matrículas de los hijos de un padre
exports.obtenerMatriculasHijos = async (req, res) => {
    const { id_padre } = req.params;

    try {
        // Obtener matrículas básicas
        const resultado = await query(
            `SELECT 
                m.id_matricula,
                m.id_estudiante,
                m.id_curso,
                m.fecha_matricula,
                m.estado,
                u.nombre as estudiante_nombre,
                u.apellido as estudiante_apellido,
                u.dni as estudiante_dni,
                c.nombre_curso,
                c.descripcion as curso_descripcion,
                c.turno as curso_turno
            FROM Relacion_Familiar rf
            JOIN Usuarios u ON rf.id_estudiante = u.id_usuario
            JOIN Matricula m ON u.id_usuario = m.id_estudiante
            JOIN Cursos c ON m.id_curso = c.id_curso
            WHERE rf.id_padre = $1 
            AND rf.activo = true
            AND m.estado = 'Activo'
            ORDER BY m.fecha_matricula DESC`,
            [id_padre]
        );

        // Para cada matrícula, obtener docentes y horarios
        const matriculasConDetalles = await Promise.all(
            resultado.rows.map(async (matricula) => {
                // Obtener docentes del curso
                const docentesResult = await query(
                    `SELECT 
                        cd.id_docente,
                        u.nombre,
                        u.apellido,
                        u.correo,
                        u.turno as docente_turno
                    FROM Curso_Docente cd
                    JOIN Usuarios u ON cd.id_docente = u.id_usuario
                    WHERE cd.id_curso = $1 AND cd.activo = true
                    ORDER BY u.apellido, u.nombre`,
                    [matricula.id_curso]
                );

                // Obtener horarios del curso
                const horariosResult = await query(
                    `SELECT 
                        h.id_horario,
                        h.dia_semana,
                        h.hora_inicio,
                        h.hora_fin,
                        h.turno,
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
                        h.hora_inicio`,
                    [matricula.id_curso]
                );

                return {
                    ...matricula,
                    docentes: docentesResult.rows,
                    horarios: horariosResult.rows
                };
            })
        );

        res.status(200).json({
            success: true,
            message: 'Matrículas de hijos obtenidas exitosamente',
            data: matriculasConDetalles
        });

    } catch (error) {
        console.error('Error en obtenerMatriculasHijos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para buscar estudiantes por nombre o DNI
exports.buscarEstudiantes = async (req, res) => {
    const { q } = req.query;

    try {
        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro de búsqueda es requerido'
            });
        }

        const busqueda = `%${q.trim()}%`;
        const resultado = await query(
            `SELECT 
                id_usuario,
                nombre,
                apellido,
                dni,
                correo,
                rol
            FROM Usuarios 
            WHERE rol = 'Estudiante' 
            AND activo = true
            AND (
                LOWER(nombre) LIKE LOWER($1) 
                OR LOWER(apellido) LIKE LOWER($1)
                OR LOWER(CONCAT(nombre, ' ', apellido)) LIKE LOWER($1)
                OR dni = $2
            )
            ORDER BY nombre, apellido
            LIMIT 20`,
            [busqueda, q.trim()]
        );

        res.status(200).json({
            success: true,
            message: 'Búsqueda realizada exitosamente',
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en buscarEstudiantes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para que un padre actualice el correo y contraseña de su hijo
exports.actualizarCredencialesHijo = async (req, res) => {
    const { id_padre, id_estudiante, nuevo_correo, nueva_contrasena } = req.body;

    try {
        // Validar datos requeridos
        if (!id_padre || !id_estudiante) {
            return res.status(400).json({
                success: false,
                message: 'ID del padre e ID del estudiante son obligatorios'
            });
        }

        if (!nuevo_correo && !nueva_contrasena) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un nuevo correo o una nueva contraseña'
            });
        }

        // Verificar que el padre existe y tiene rol de Padre
        const padreExiste = await query(
            'SELECT id_usuario FROM Usuarios WHERE id_usuario = $1 AND rol = $2 AND activo = true',
            [id_padre, 'Padre']
        );

        if (padreExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'El usuario padre no existe o no tiene el rol correcto'
            });
        }

        // Verificar que el estudiante existe y tiene rol de Estudiante
        const estudianteExiste = await query(
            'SELECT id_usuario, correo FROM Usuarios WHERE id_usuario = $1 AND rol = $2 AND activo = true',
            [id_estudiante, 'Estudiante']
        );

        if (estudianteExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'El estudiante no existe o no tiene el rol correcto'
            });
        }

        // Verificar que existe una relación familiar entre el padre y el estudiante
        const relacionExiste = await query(
            'SELECT * FROM Relacion_Familiar WHERE id_padre = $1 AND id_estudiante = $2 AND activo = true',
            [id_padre, id_estudiante]
        );

        if (relacionExiste.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permiso para modificar las credenciales de este estudiante'
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
                [nuevo_correo.trim().toLowerCase(), id_estudiante]
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
                [nuevo_correo.trim().toLowerCase(), id_estudiante]
            );
        }

        // Actualizar contraseña si se proporciona
        if (nueva_contrasena) {
            const saltRounds = 12;
            const contrasenaHash = await bcrypt.hash(nueva_contrasena, saltRounds);
            await query(
                'UPDATE Usuarios SET contrasena = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_usuario = $2',
                [contrasenaHash, id_estudiante]
            );
        }

        // Obtener los datos actualizados del estudiante
        const estudianteActualizado = await query(
            'SELECT id_usuario, nombre, apellido, correo, rol FROM Usuarios WHERE id_usuario = $1',
            [id_estudiante]
        );

        res.status(200).json({
            success: true,
            message: 'Credenciales actualizadas exitosamente',
            data: {
                estudiante: estudianteActualizado.rows[0],
                actualizado: {
                    correo: nuevo_correo ? true : false,
                    contrasena: nueva_contrasena ? true : false
                }
            }
        });

    } catch (error) {
        console.error('Error en actualizarCredencialesHijo:', error);
        
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
