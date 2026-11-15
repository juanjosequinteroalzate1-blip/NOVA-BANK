const express = require('express');
const router = express.Router();

const cajeroController = require('../controllers/cajeroController');

const {
    verificarSesionCajero
} = require('../middlewares/authMiddleware');

// Ingresar al cajero (no requiere sesión previa)
router.post('/ingresar', cajeroController.ingresarCajero);

// Consultar saldo
router.get(
    '/saldo',
    verificarSesionCajero,
    cajeroController.consultarSaldo
);

// Retirar dinero
router.post(
    '/retirar',
    verificarSesionCajero,
    cajeroController.retirarDinero
);

// Consultar últimos movimientos
router.get(
    '/movimientos',
    verificarSesionCajero,
    cajeroController.consultarMovimientos
);

// Cerrar operación
router.post(
    '/cerrar',
    verificarSesionCajero,
    cajeroController.cerrarCajero
);

module.exports = router;