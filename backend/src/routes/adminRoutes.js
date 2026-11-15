
const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');

const {
    verificarSesion,
    soloAdmin
} = require('../middlewares/authMiddleware');

// Consultar todos los clientes
router.get(
    '/clientes',
    verificarSesion,
    soloAdmin,
    adminController.obtenerClientes
);

// Buscar clientes
router.get(
    '/clientes/buscar',
    verificarSesion,
    soloAdmin,
    adminController.buscarClientes
);

// Consultar información detallada de un cliente
router.get(
    '/clientes/:id',
    verificarSesion,
    soloAdmin,
    adminController.obtenerClientePorId
);

// Editar información de un cliente
router.put(
    '/clientes/:id',
    verificarSesion,
    soloAdmin,
    adminController.editarCliente
);

// Cambiar estado de un cliente (bloquear o activar)
router.put(
    '/clientes/:id/estado',
    verificarSesion,
    soloAdmin,
    adminController.cambiarEstadoCliente
);

// Registrar un nuevo cliente
router.post(
    '/clientes',
    verificarSesion,
    soloAdmin,
    adminController.registrarCliente
);


 // Abrir una cuenta bancaria para un cliente
router.post(
    '/cuentas',
    verificarSesion,
    soloAdmin,
    adminController.abrirCuenta
);


// Consultar todas las cuentas bancarias
router.get(
    '/cuentas',
    verificarSesion,
    soloAdmin,
    adminController.obtenerCuentas
);

// Consultar el historial general de movimientos
router.get(
    '/movimientos',
    verificarSesion,
    soloAdmin,
    adminController.obtenerMovimientos
);


// Consultar el resumen general del banco
router.get(
    '/resumen',
    verificarSesion,
    soloAdmin,
    adminController.obtenerResumen
);

module.exports = router;
