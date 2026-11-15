
const conexion = require('../config/db');
const bcrypt = require('bcryptjs');

// Identificar al cliente en el cajero automático
exports.ingresarCajero = async (req, res) => {
    try {
        const { numero_cuenta, pin } = req.body;

        if (!numero_cuenta || !pin) {
            return res.status(400).json({
                mensaje: 'Debes ingresar el número de cuenta y el PIN'
            });
        }

        if (!/^\d{4}$/.test(String(pin))) {
            return res.status(400).json({
                mensaje: 'El PIN debe tener exactamente 4 números'
            });
        }

        // Buscar la cuenta y los datos de su titular
        const [cuentas] = await conexion.execute(
            `SELECT
                c.id,
                c.numero_cuenta,
                c.tipo_cuenta,
                c.saldo,
                u.id AS usuario_id,
                u.nombre,
                u.apellido,
                u.pin,
                u.estado
            FROM cuentas c
            INNER JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.numero_cuenta = ?
            AND u.rol = 'cliente'
            LIMIT 1`,
            [numero_cuenta]
        );

        if (cuentas.length === 0) {
            return res.status(401).json({
                mensaje: 'Número de cuenta o PIN incorrectos'
            });
        }

        const cuenta = cuentas[0];

        // Comprobar que el titular esté activo
        if (cuenta.estado !== 'activo') {
            return res.status(403).json({
                mensaje: 'El cliente se encuentra bloqueado'
            });
        }

        // Verificar el PIN protegido con bcrypt
        const pinValido = await bcrypt.compare(
            String(pin),
            cuenta.pin
        );

        if (!pinValido) {
            return res.status(401).json({
                mensaje: 'Número de cuenta o PIN incorrectos'
            });
        }

        // Guardar la cuenta identificada en la sesión del cajero
        req.session.cajero = {
            cuenta_id: cuenta.id,
            usuario_id: cuenta.usuario_id,
            numero_cuenta: cuenta.numero_cuenta,
            nombre: cuenta.nombre,
            apellido: cuenta.apellido
        };

        return res.json({
            mensaje: 'Ingreso al cajero exitoso',
            cliente: {
                nombre: cuenta.nombre,
                apellido: cuenta.apellido,
                numero_cuenta: cuenta.numero_cuenta,
                tipo_cuenta: cuenta.tipo_cuenta
            }
        });

    } catch (error) {
        console.error('Error al ingresar al cajero:', error);

        return res.status(500).json({
            mensaje: 'Error al ingresar al cajero automático'
        });
    }
};

 // Consultar saldo desde el cajero automático
exports.consultarSaldo = async (req, res) => {
    try {
        if (!req.session.cajero) {
            return res.status(401).json({
                mensaje: 'Debes ingresar primero al cajero'
            });
        }

        const cuentaId = req.session.cajero.cuenta_id;

        const [cuentas] = await conexion.execute(
            `SELECT numero_cuenta, tipo_cuenta, saldo
             FROM cuentas
             WHERE id = ?`,
            [cuentaId]
        );

        if (cuentas.length === 0) {
            return res.status(404).json({
                mensaje: 'No se encontró la cuenta bancaria'
            });
        }

        return res.json({
            mensaje: 'Saldo consultado correctamente',
            cuenta: cuentas[0]
        });

    } catch (error) {
        console.error('Error al consultar saldo:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar el saldo'
        });
    }
};
// Realizar retiro desde el cajero automático
exports.retirarDinero = async (req, res) => {
    const conexionBD = await conexion.getConnection();

    try {
        if (!req.session.cajero) {
            return res.status(401).json({
                mensaje: 'Debes ingresar primero al cajero'
            });
        }

        const { monto } = req.body;

        if (!monto || !Number.isFinite(Number(monto)) || Number(monto) <= 0) {
            return res.status(400).json({
                mensaje: 'El monto debe ser mayor a cero'
            });
        }

        await conexionBD.beginTransaction();

        const cuentaId = req.session.cajero.cuenta_id;

        const [cuentas] = await conexionBD.execute(
            `SELECT c.id, c.saldo, u.estado
             FROM cuentas c
             INNER JOIN usuarios u ON c.usuario_id = u.id
             WHERE c.id = ?
             FOR UPDATE`,
            [cuentaId]
        );

        if (cuentas.length === 0) {
            await conexionBD.rollback();
            return res.status(404).json({
                mensaje: 'No se encontró la cuenta'
            });
        }

        const cuenta = cuentas[0];

        if (cuenta.estado !== 'activo') {
            await conexionBD.rollback();
            return res.status(403).json({
                mensaje: 'La cuenta está bloqueada'
            });
        }

        if (Number(monto) > Number(cuenta.saldo)) {
            await conexionBD.rollback();
            return res.status(400).json({
                mensaje: 'Saldo insuficiente'
            });
        }

        const nuevoSaldo = Number(cuenta.saldo) - Number(monto);

        await conexionBD.execute(
            'UPDATE cuentas SET saldo = ? WHERE id = ?',
            [nuevoSaldo, cuentaId]
        );

        await conexionBD.execute(
            `INSERT INTO movimientos
             (cuenta_id, tipo, descripcion, monto, saldo_resultante)
             VALUES (?, 'retiro', 'Retiro realizado desde cajero automático', ?, ?)`,
            [cuentaId, monto, nuevoSaldo]
        );

        await conexionBD.commit();

        return res.json({
            mensaje: 'Retiro realizado correctamente',
            monto_retirado: Number(monto),
            nuevo_saldo: nuevoSaldo
        });

    } catch (error) {
        await conexionBD.rollback();
        console.error('Error al retirar dinero:', error);

        return res.status(500).json({
            mensaje: 'Error al realizar el retiro'
        });

    } finally {
        conexionBD.release();
    }
};
// Consultar los últimos movimientos desde el cajero
exports.consultarMovimientos = async (req, res) => {
    try {
        if (!req.session.cajero) {
            return res.status(401).json({
                mensaje: 'Debes ingresar primero al cajero'
            });
        }

        const cuentaId = req.session.cajero.cuenta_id;

        const [movimientos] = await conexion.execute(
            `SELECT tipo, descripcion, monto, saldo_resultante, fecha
             FROM movimientos
             WHERE cuenta_id = ?
             ORDER BY fecha DESC
             LIMIT 5`,
            [cuentaId]
        );

        return res.json({
            mensaje: 'Movimientos consultados correctamente',
            movimientos
        });

    } catch (error) {
        console.error('Error al consultar movimientos:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar los movimientos'
        });
    }
};
// Cerrar sesión del cajero automático
exports.cerrarCajero = async (req, res) => {
    try {
        if (!req.session.cajero) {
            return res.status(401).json({
                mensaje: 'No hay una sesión de cajero activa'
            });
        }

        delete req.session.cajero;

        req.session.save((error) => {
            if (error) {
                console.error('Error al cerrar el cajero:', error);

                return res.status(500).json({
                    mensaje: 'Error al cerrar la operación'
                });
            }

            return res.json({
                mensaje: 'Operación del cajero cerrada correctamente'
            });
        });

    } catch (error) {
        console.error('Error al cerrar el cajero:', error);

        return res.status(500).json({
            mensaje: 'Error al cerrar la operación'
        });
    }
};