
const express = require('express');
const router = express.Router();

const {
    verificarSesion,
    soloAdmin,
    soloCliente
} = require('../middlewares/authMiddleware');

// Ruta exclusiva para administradores
router.get('/admin', verificarSesion, soloAdmin, (req, res) => {
    res.json({
        mensaje: 'Bienvenido al panel de administración de NOVA BANK',
        usuario: req.session.usuario
    });
});

// Ruta exclusiva para clientes
router.get('/cliente', verificarSesion, soloCliente, (req, res) => {
    res.json({
        mensaje: 'Bienvenido a tu banca virtual NOVA BANK',
        usuario: req.session.usuario
    });
});

module.exports = router;
