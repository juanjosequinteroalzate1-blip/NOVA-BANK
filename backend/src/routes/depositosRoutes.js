
const express = require('express');
const router = express.Router();

const depositosController = require('../controllers/depositosController');

const {
    verificarSesion,
    soloAdmin
} = require('../middlewares/authMiddleware');

// Solo el administrador puede realizar depósitos
router.post(
    '/',
    verificarSesion,
    soloAdmin,
    depositosController.realizarDeposito
);

module.exports = router;
