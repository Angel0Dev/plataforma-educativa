const express = require('express');
const router = express.Router();
const { loginUsuario, verificarToken } = require('../controllers/auth.controller');

// Ruta para iniciar sesión
router.post('/login', loginUsuario);

// Ruta para verificar token y usuario
router.post('/verificar', verificarToken);
router.post('/verify', verificarToken); // Mantener compatibilidad

module.exports = router;
