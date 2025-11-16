// Middleware de validación para el microservicio de usuarios

// Validación para el registro de usuarios
const validarRegistro = (req, res, next) => {
    const { nombre, apellido, correo, contrasena, rol } = req.body;
    const errores = [];

    // Validar nombre
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
        errores.push('El nombre debe tener al menos 2 caracteres');
    }

    // Validar apellido
    if (!apellido || typeof apellido !== 'string' || apellido.trim().length < 2) {
        errores.push('El apellido debe tener al menos 2 caracteres');
    }

    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correo || !emailRegex.test(correo)) {
        errores.push('El correo electrónico no es válido');
    }

    // Validar contraseña
    if (!contrasena || contrasena.length < 6) {
        errores.push('La contraseña debe tener al menos 6 caracteres');
    }

    // Validar rol
    const rolesValidos = ['Docente', 'Estudiante', 'Padre'];
    if (!rol || !rolesValidos.includes(rol)) {
        errores.push('El rol debe ser: Docente, Estudiante o Padre');
    }

    // Si hay errores, devolver respuesta de error
    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Datos de entrada inválidos',
            errors: errores
        });
    }

    // Limpiar datos antes de continuar
    req.body = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.trim().toLowerCase(),
        contrasena: contrasena,
        rol: rol
    };

    next();
};

// Validación para obtener usuario por ID
const validarIdUsuario = (req, res, next) => {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'ID de usuario inválido'
        });
    }

    req.params.id = parseInt(id);
    next();
};

module.exports = {
    validarRegistro,
    validarIdUsuario
};
