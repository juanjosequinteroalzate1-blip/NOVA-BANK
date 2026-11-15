
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

const {
    verificarSesion,
    soloCliente
} = require('../middlewares/authMiddleware');

// Ruta para iniciar sesión
router.post('/login', authController.login);

// Ruta para consultar el usuario autenticado
router.get('/perfil', authController.perfil);

// Ruta para cerrar sesión
router.post('/logout', authController.logout);

// Actualizar información personal del cliente
router.put(
    '/perfil',
    verificarSesion,
    soloCliente,
    authController.actualizarPerfil
);

// Cambiar contraseña del cliente
router.put(
    '/cambiar-password',
    verificarSesion,
    soloCliente,
    authController.cambiarPassword
);

module.exports = router;
