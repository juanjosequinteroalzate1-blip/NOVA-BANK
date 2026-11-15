
const conexion = require('../config/db');

// Realizar un depósito bancario
exports.realizarDeposito = async (req, res) => {
    const { numero_cuenta, monto, descripcion } = req.body;

    if (!numero_cuenta || monto === undefined || monto === null) {
        return res.status(400).json({
            mensaje: 'Debes indicar una cuenta y un monto válido'
        });
    }

    const valor = Number(monto);

    if (!Number.isFinite(valor) || valor <= 0) {
        return res.status(400).json({
            mensaje: 'El monto debe ser mayor que cero'
        });
    }

    let conexionDB;

    try {
        conexionDB = await conexion.getConnection();
        await conexionDB.beginTransaction();

        // Buscar la cuenta y verificar el estado del titular
        const [cuentas] = await conexionDB.execute(
            `SELECT
                c.id,
                c.numero_cuenta,
                c.saldo,
                u.estado
             FROM cuentas c
             INNER JOIN usuarios u ON c.usuario_id = u.id
             WHERE c.numero_cuenta = ?
             FOR UPDATE`,
            [numero_cuenta]
        );

        if (cuentas.length === 0) {
            await conexionDB.rollback();

            return res.status(404).json({
                mensaje: 'La cuenta bancaria no existe'
            });
        }

        const cuenta = cuentas[0];

        if (cuenta.estado !== 'activo') {
            await conexionDB.rollback();

            return res.status(403).json({
                mensaje: 'No se puede realizar un depósito a una cuenta bloqueada'
            });
        }

        // Calcular el nuevo saldo
        const saldoAnterior = Number(cuenta.saldo);
        const saldoNuevo = saldoAnterior + valor;

        // Actualizar el saldo
        await conexionDB.execute(
            'UPDATE cuentas SET saldo = ? WHERE id = ?',
            [saldoNuevo, cuenta.id]
        );

        // Registrar el movimiento con el saldo resultante
        await conexionDB.execute(
            `INSERT INTO movimientos
             (cuenta_id, tipo, monto, descripcion, saldo_resultante)
             VALUES (?, 'deposito', ?, ?, ?)`,
            [
                cuenta.id,
                valor,
                descripcion || 'Deposito realizado por el administrador',
                saldoNuevo
            ]
        );

        await conexionDB.commit();

        return res.json({
            mensaje: 'Depósito realizado correctamente',
            numero_cuenta: cuenta.numero_cuenta,
            monto: valor,
            saldo_anterior: saldoAnterior,
            saldo_nuevo: saldoNuevo
        });

    } catch (error) {
        if (conexionDB) {
            await conexionDB.rollback();
        }

        console.error('Error al realizar depósito:', error);

        return res.status(500).json({
            mensaje: 'Error al realizar el depósito'
        });

    } finally {
        if (conexionDB) {
            conexionDB.release();
        }
    }
};
