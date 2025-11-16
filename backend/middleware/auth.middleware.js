const { query } = require('../config/db.config');

// Middleware para verificar que el usuario existe y está activo
const verificarUsuario = async (req, res, next) => {
    try {
        // Obtener el ID del usuario desde el token o headers
        const userId = req.headers['user-id'] || req.body.id_usuario || req.params.id_usuario;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no identificado',
                redirect: '/login'
            });
        }

        // Verificar que el usuario existe y está activo
        const usuario = await query(
            'SELECT id_usuario, nombre, apellido, correo, rol, activo FROM Usuarios WHERE id_usuario = $1',
            [userId]
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

        // Agregar información del usuario al request
        req.usuario = usuario.rows[0];
        next();
    } catch (error) {
        console.error('Error en verificarUsuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar usuario',
            redirect: '/login'
        });
    }
};

// Función para verificar usuario por correo
const verificarUsuarioPorCorreo = async (req, res, next) => {
    try {
        const correo = req.headers['user-email'] || req.body.correo;
        
        if (!correo) {
            return res.status(401).json({
                success: false,
                message: 'Correo no proporcionado',
                redirect: '/login'
            });
        }

        const usuario = await query(
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

        req.usuario = usuario.rows[0];
        next();
    } catch (error) {
        console.error('Error en verificarUsuarioPorCorreo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar usuario',
            redirect: '/login'
        });
    }
};

module.exports = {
    verificarUsuario,
    verificarUsuarioPorCorreo
};

