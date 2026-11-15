
const express = require('express');
const router = express.Router();

const retirosController = require('../controllers/retirosController');

const {
    verificarSesion,
    soloCliente
} = require('../middlewares/authMiddleware');

// Solo los clientes pueden realizar retiros
router.post(
    '/',
    verificarSesion,
    soloCliente,
    retirosController.realizarRetiro
);

module.exports = router;
