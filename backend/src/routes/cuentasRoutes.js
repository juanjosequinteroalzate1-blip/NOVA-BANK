
const express = require('express');
const router = express.Router();

const cuentasController = require('../controllers/cuentasController');
const { verificarSesion, soloCliente } = require('../middlewares/authMiddleware');

// Consultar las cuentas del cliente autenticado
router.get('/', verificarSesion, soloCliente, cuentasController.obtenerCuentas);

module.exports = router;
