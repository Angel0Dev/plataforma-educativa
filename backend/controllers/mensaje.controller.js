const { query } = require('../config/db.config');

// Función para enviar un mensaje
exports.enviarMensaje = async (req, res) => {
    const { id_remitente, id_destinatario, asunto, contenido, id_curso } = req.body;
    const archivoAdjunto = req.file ? `/uploads/mensajes/${req.file.filename}` : null;

    try {
        // Validar datos requeridos
        if (!id_remitente || !id_destinatario || !contenido) {
            return res.status(400).json({
                success: false,
                message: 'Remitente, destinatario y contenido son obligatorios'
            });
        }

        // Verificar que el remitente existe
        const remitenteExiste = await query(
            'SELECT id_usuario, nombre, apellido FROM Usuarios WHERE id_usuario = $1 AND activo = true',
            [id_remitente]
        );

        if (remitenteExiste.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El remitente no existe o está inactivo'
            });
        }

        // Verificar que el destinatario existe
        const destinatarioExiste = await query(
            'SELECT id_usuario, nombre, apellido FROM Usuarios WHERE id_usuario = $1 AND activo = true',
            [id_destinatario]
        );

        if (destinatarioExiste.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El destinatario no existe o está inactivo'
            });
        }

        // Si se especifica un curso, verificar que existe
        if (id_curso) {
            const cursoExiste = await query(
                'SELECT id_curso, nombre_curso FROM Cursos WHERE id_curso = $1 AND activo = true',
                [id_curso]
            );

            if (cursoExiste.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El curso especificado no existe o está inactivo'
                });
            }
        }

        // Insertar mensaje en la base de datos (usando nombres correctos de columnas: id_emisor, id_receptor, cuerpo)
        const resultado = await query(
            `INSERT INTO Mensajes (id_emisor, id_receptor, asunto, cuerpo, archivo_adjunto) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id_mensaje, fecha_envio`,
            [id_remitente, id_destinatario, asunto || null, contenido, archivoAdjunto]
        );

        const nuevoMensaje = resultado.rows[0];
        const remitente = remitenteExiste.rows[0];
        const destinatario = destinatarioExiste.rows[0];

        res.status(201).json({
            success: true,
            message: 'Mensaje enviado exitosamente',
            data: {
                id_mensaje: nuevoMensaje.id_mensaje,
                remitente: {
                    id: remitente.id_usuario,
                    nombre: remitente.nombre,
                    apellido: remitente.apellido
                },
                destinatario: {
                    id: destinatario.id_usuario,
                    nombre: destinatario.nombre,
                    apellido: destinatario.apellido
                },
                asunto: asunto,
                contenido: contenido,
                fecha_envio: nuevoMensaje.fecha_envio,
                id_curso: id_curso,
                archivo_adjunto: archivoAdjunto
            }
        });

    } catch (error) {
        console.error('Error en enviarMensaje:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener mensajes de un usuario
exports.obtenerMensajes = async (req, res) => {
    const { id_usuario } = req.params;
    const { tipo = 'recibidos' } = req.query; // 'recibidos' o 'enviados'

    try {
        let consulta;
        let parametros;

        if (tipo === 'recibidos') {
            consulta = `
                SELECT 
                    m.id_mensaje,
                    m.id_emisor,
                    m.id_receptor,
                    m.asunto,
                    m.cuerpo as contenido,
                    m.fecha_envio,
                    m.leido,
                    m.archivo_adjunto,
                    u_rem.id_usuario as remitente_id,
                    u_rem.nombre as remitente_nombre,
                    u_rem.apellido as remitente_apellido,
                    u_rem.correo as remitente_correo,
                    u_rem.rol as remitente_rol
                FROM Mensajes m
                JOIN Usuarios u_rem ON m.id_emisor = u_rem.id_usuario
                WHERE m.id_receptor = $1
                ORDER BY m.fecha_envio DESC
            `;
            parametros = [id_usuario];
        } else {
            consulta = `
                SELECT 
                    m.id_mensaje,
                    m.id_emisor,
                    m.id_receptor,
                    m.asunto,
                    m.cuerpo as contenido,
                    m.fecha_envio,
                    m.leido,
                    m.archivo_adjunto,
                    u_dest.id_usuario as destinatario_id,
                    u_dest.nombre as destinatario_nombre,
                    u_dest.apellido as destinatario_apellido,
                    u_dest.correo as destinatario_correo,
                    u_dest.rol as destinatario_rol
                FROM Mensajes m
                JOIN Usuarios u_dest ON m.id_receptor = u_dest.id_usuario
                WHERE m.id_emisor = $1
                ORDER BY m.fecha_envio DESC
            `;
            parametros = [id_usuario];
        }

        const resultado = await query(consulta, parametros);

        res.status(200).json({
            success: true,
            message: `Mensajes ${tipo} obtenidos exitosamente`,
            data: resultado.rows
        });

    } catch (error) {
        console.error('Error en obtenerMensajes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para marcar mensaje como leído
exports.marcarComoLeido = async (req, res) => {
    const { id_mensaje } = req.params;

    try {
        const resultado = await query(
            'UPDATE Mensajes SET leido = true WHERE id_mensaje = $1 RETURNING *',
            [id_mensaje]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mensaje no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mensaje marcado como leído',
            data: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en marcarComoLeido:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener estadísticas de mensajes
exports.obtenerEstadisticasMensajes = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const [mensajesRecibidos, mensajesEnviados, mensajesNoLeidos] = await Promise.all([
            query('SELECT COUNT(*) as total FROM Mensajes WHERE id_receptor = $1', [id_usuario]),
            query('SELECT COUNT(*) as total FROM Mensajes WHERE id_emisor = $1', [id_usuario]),
            query('SELECT COUNT(*) as total FROM Mensajes WHERE id_receptor = $1 AND leido = false', [id_usuario])
        ]);

        res.status(200).json({
            success: true,
            message: 'Estadísticas de mensajes obtenidas exitosamente',
            data: {
                mensajes_recibidos: parseInt(mensajesRecibidos.rows[0].total),
                mensajes_enviados: parseInt(mensajesEnviados.rows[0].total),
                mensajes_no_leidos: parseInt(mensajesNoLeidos.rows[0].total)
            }
        });

    } catch (error) {
        console.error('Error en obtenerEstadisticasMensajes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para obtener un mensaje por ID
exports.obtenerMensajePorId = async (req, res) => {
    const { id_mensaje } = req.params;

    try {
        const resultado = await query(`
            SELECT 
                m.*,
                u_rem.nombre as remitente_nombre,
                u_rem.apellido as remitente_apellido,
                u_rem.correo as remitente_correo,
                u_rem.rol as remitente_rol,
                u_dest.nombre as destinatario_nombre,
                u_dest.apellido as destinatario_apellido,
                u_dest.correo as destinatario_correo,
                u_dest.rol as destinatario_rol
            FROM Mensajes m
            JOIN Usuarios u_rem ON m.id_emisor = u_rem.id_usuario
            JOIN Usuarios u_dest ON m.id_receptor = u_dest.id_usuario
            WHERE m.id_mensaje = $1
        `, [id_mensaje]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mensaje no encontrado'
            });
        }

        const mensaje = resultado.rows[0];
        res.status(200).json({
            success: true,
            message: 'Mensaje obtenido exitosamente',
            data: {
                ...mensaje,
                contenido: mensaje.cuerpo
            }
        });

    } catch (error) {
        console.error('Error en obtenerMensajePorId:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para editar un mensaje (solo si es el remitente y no ha sido leído)
exports.editarMensaje = async (req, res) => {
    const { id_mensaje } = req.params;
    const { id_remitente, asunto, contenido } = req.body;
    const archivoAdjunto = req.file ? `/uploads/mensajes/${req.file.filename}` : null;

    try {
        // Verificar que el mensaje existe y pertenece al remitente
        const mensajeExiste = await query(
            'SELECT id_emisor, leido, archivo_adjunto FROM Mensajes WHERE id_mensaje = $1',
            [id_mensaje]
        );

        if (mensajeExiste.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mensaje no encontrado'
            });
        }

        const mensaje = mensajeExiste.rows[0];

        // Verificar que el remitente es el dueño del mensaje
        if (mensaje.id_emisor !== parseInt(id_remitente)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para editar este mensaje'
            });
        }

        // Verificar que el mensaje no ha sido leído
        if (mensaje.leido) {
            return res.status(400).json({
                success: false,
                message: 'No se puede editar un mensaje que ya ha sido leído'
            });
        }

        // Actualizar el mensaje
        const campos = [];
        const valores = [];
        let contador = 1;

        if (asunto !== undefined) {
            campos.push(`asunto = $${contador}`);
            valores.push(asunto);
            contador++;
        }

        if (contenido !== undefined) {
            campos.push(`cuerpo = $${contador}`);
            valores.push(contenido);
            contador++;
        }

        if (archivoAdjunto !== null) {
            campos.push(`archivo_adjunto = $${contador}`);
            valores.push(archivoAdjunto);
            contador++;
        }

        if (campos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay campos para actualizar'
            });
        }

        valores.push(id_mensaje);
        const queryUpdate = `
            UPDATE Mensajes 
            SET ${campos.join(', ')}
            WHERE id_mensaje = $${contador}
            RETURNING *
        `;

        const resultado = await query(queryUpdate, valores);

        res.status(200).json({
            success: true,
            message: 'Mensaje actualizado exitosamente',
            data: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error en editarMensaje:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
