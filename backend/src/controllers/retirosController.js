
const conexion = require('../config/db');

// Realizar un retiro bancario
exports.realizarRetiro = async (req, res) => {
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

        // Buscar la cuenta y comprobar el estado del titular
        const [cuentas] = await conexionDB.execute(
            `SELECT
                c.id,
                c.numero_cuenta,
                c.saldo,
                u.estado
             FROM cuentas c
             INNER JOIN usuarios u ON c.usuario_id = u.id
             WHERE c.numero_cuenta = ?
             AND c.usuario_id = ?
             FOR UPDATE`,
            [numero_cuenta, req.session.usuario.id]
        );

        if (cuentas.length === 0) {
            await conexionDB.rollback();

            return res.status(404).json({
                mensaje: 'La cuenta no existe o no te pertenece'
            });
        }

        const cuenta = cuentas[0];

        // Verificar que el cliente esté activo
        if (cuenta.estado !== 'activo') {
            await conexionDB.rollback();

            return res.status(403).json({
                mensaje: 'Tu cuenta se encuentra bloqueada'
            });
        }

        const saldoAnterior = Number(cuenta.saldo);

        // Verificar saldo suficiente
        if (saldoAnterior < valor) {
            await conexionDB.rollback();

            return res.status(400).json({
                mensaje: 'Saldo insuficiente para realizar el retiro',
                saldo_disponible: saldoAnterior
            });
        }

        // Calcular nuevo saldo
        const saldoNuevo = saldoAnterior - valor;

        // Actualizar saldo de la cuenta
        await conexionDB.execute(
            'UPDATE cuentas SET saldo = ? WHERE id = ?',
            [saldoNuevo, cuenta.id]
        );

        // Registrar movimiento con saldo resultante
        await conexionDB.execute(
            `INSERT INTO movimientos
             (cuenta_id, tipo, monto, descripcion, saldo_resultante)
             VALUES (?, 'retiro', ?, ?, ?)`,
            [
                cuenta.id,
                valor,
                descripcion || 'Retiro realizado por el cliente',
                saldoNuevo
            ]
        );

        await conexionDB.commit();

        return res.json({
            mensaje: 'Retiro realizado correctamente',
            numero_cuenta: cuenta.numero_cuenta,
            monto: valor,
            saldo_anterior: saldoAnterior,
            saldo_nuevo: saldoNuevo
        });

    } catch (error) {
        if (conexionDB) {
            await conexionDB.rollback();
        }

        console.error('Error al realizar retiro:', error);

        return res.status(500).json({
            mensaje: 'Error al realizar el retiro'
        });

    } finally {
        if (conexionDB) {
            conexionDB.release();
        }
    }
};
