const bcrypt = require('bcryptjs');
const pool = require('../config/db.config');

// Función para iniciar sesión
const loginUsuario = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        // Validar que se proporcionen los campos requeridos
        if (!correo || !contrasena) {
            return res.status(400).json({
                success: false,
                message: 'El correo y la contraseña son requeridos'
            });
        }

        console.log(`🔍 Intentando login para: ${correo}`);

        // Buscar el usuario en la base de datos
        const usuarioQuery = 'SELECT id_usuario, nombre, apellido, correo, contrasena, rol, activo FROM Usuarios WHERE correo = $1';
        const result = await pool.query(usuarioQuery, [correo]);

        if (result.rows.length === 0) {
            console.log(`❌ Usuario no encontrado: ${correo}`);
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        const usuario = result.rows[0];
        
        // Verificar que el usuario esté activo
        if (!usuario.activo) {
            console.log(`❌ Usuario inactivo: ${correo}`);
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        console.log(`✅ Usuario encontrado: ${usuario.nombre} ${usuario.apellido}`);
        
        // Limpiar la contraseña de espacios en blanco al inicio y final
        const contrasenaLimpia = String(contrasena || '').trim();
        
        // Debug: mostrar información de la contraseña recibida
        console.log(`🔍 Contraseña recibida: "${contrasenaLimpia}" (longitud: ${contrasenaLimpia.length})`);
        
        // Verificar la contraseña
        const contrasenaValida = await bcrypt.compare(contrasenaLimpia, usuario.contrasena);
        
        if (!contrasenaValida) {
            console.log(`❌ Contraseña incorrecta para: ${correo}`);
            console.log(`   Intentando con "admin123" para verificar el hash...`);
            const hashFunciona = await bcrypt.compare('admin123', usuario.contrasena);
            console.log(`   ¿El hash funciona con "admin123"?: ${hashFunciona ? '✅ SÍ' : '❌ NO'}`);
            
            if (hashFunciona) {
                console.log(`   ⚠️ La contraseña recibida no coincide con "admin123"`);
                console.log(`   Recibido: "${contrasenaLimpia}" (longitud: ${contrasenaLimpia.length})`);
                console.log(`   Esperado: "admin123" (longitud: 8)`);
            }
            
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }
        
        console.log(`✅ Contraseña válida - Login exitoso para: ${usuario.nombre} ${usuario.apellido}`);

        // Preparar datos del usuario para la respuesta (sin la contraseña)
        const usuarioResponse = {
            id: usuario.id_usuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            rol: usuario.rol
        };

        // En una implementación real, aquí generarías un JWT token
        const token = `token_${usuario.id_usuario}_${Date.now()}`;

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            user: usuarioResponse,
            token: token
        });

    } catch (error) {
        console.error('❌ Error en loginUsuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Función para verificar el token y el usuario
const verificarToken = async (req, res) => {
    try {
        const { token, id_usuario, correo } = req.body;

        // Si se proporciona ID de usuario, verificar por ID
        if (id_usuario) {
            const usuario = await pool.query(
                'SELECT id_usuario, nombre, apellido, correo, rol, activo FROM Usuarios WHERE id_usuario = $1',
                [id_usuario]
            );

            if (usuario.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no encontrado',
                    redirect: '/login'
                });
            }

            if (!usuario.rows[0].activo) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario inactivo',
                    redirect: '/login'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Usuario válido',
                user: {
                    id: usuario.rows[0].id_usuario,
                    nombre: usuario.rows[0].nombre,
                    apellido: usuario.rows[0].apellido,
                    correo: usuario.rows[0].correo,
                    rol: usuario.rows[0].rol
                }
            });
        }

        // Si se proporciona correo, verificar por correo
        if (correo) {
            const usuario = await pool.query(
                'SELECT id_usuario, nombre, apellido, correo, rol, activo FROM Usuarios WHERE correo = $1',
                [correo]
            );

            if (usuario.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no encontrado',
                    redirect: '/login'
                });
            }

            if (!usuario.rows[0].activo) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario inactivo',
                    redirect: '/login'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Usuario válido',
                user: {
                    id: usuario.rows[0].id_usuario,
                    nombre: usuario.rows[0].nombre,
                    apellido: usuario.rows[0].apellido,
                    correo: usuario.rows[0].correo,
                    rol: usuario.rows[0].rol
                }
            });
        }

        // Verificación por token (legacy)
        if (token && token.startsWith('token_')) {
            res.status(200).json({
                success: true,
                message: 'Token válido'
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Token o credenciales requeridas',
                redirect: '/login'
            });
        }

    } catch (error) {
        console.error('❌ Error en verificarToken:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
            redirect: '/login'
        });
    }
};

module.exports = {
    loginUsuario,
    verificarToken
};
