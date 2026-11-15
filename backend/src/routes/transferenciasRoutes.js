
const express = require('express');
const router = express.Router();

const transferenciasController = require('../controllers/transferenciasController');

const {
    verificarSesion,
    soloCliente
} = require('../middlewares/authMiddleware');

// Realizar una transferencia
router.post(
    '/',
    verificarSesion,
    soloCliente,
    transferenciasController.realizarTransferencia
);

module.exports = router;
