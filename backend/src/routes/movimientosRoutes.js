
const express = require('express');
const router = express.Router();

const movimientosController = require('../controllers/movimientosController');
const { verificarSesion, soloCliente } = require('../middlewares/authMiddleware');

// Consultar historial del cliente
router.get('/', verificarSesion, soloCliente, movimientosController.obtenerMovimientos);

module.exports = router;
