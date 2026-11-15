
const conexion = require('../config/db');

// Realizar una transferencia bancaria
exports.realizarTransferencia = async (req, res) => {
    const { numero_cuenta_destino, monto, descripcion } = req.body;
    const usuarioId = req.session.usuario.id;

    if (!numero_cuenta_destino || monto === undefined || monto === null) {
        return res.status(400).json({
            mensaje: 'Debes indicar la cuenta destino y el monto'
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

        // Buscar y bloquear la cuenta de origen
        const [origenes] = await conexionDB.execute(
            `SELECT 
                c.id,
                c.numero_cuenta,
                c.saldo,
                u.estado
             FROM cuentas c
             INNER JOIN usuarios u ON c.usuario_id = u.id
             WHERE c.usuario_id = ?
             FOR UPDATE`,
            [usuarioId]
        );

        if (origenes.length === 0) {
            await conexionDB.rollback();
            return res.status(404).json({
                mensaje: 'No tienes una cuenta bancaria'
            });
        }

        const origen = origenes[0];

        // Verificar que el titular de origen esté activo
        if (origen.estado !== 'activo') {
            await conexionDB.rollback();
            return res.status(403).json({
                mensaje: 'Tu cuenta se encuentra bloqueada'
            });
        }

        // Buscar y bloquear la cuenta de destino
        const [destinos] = await conexionDB.execute(
            `SELECT
                c.id,
                c.numero_cuenta,
                c.saldo,
                u.estado
             FROM cuentas c
             INNER JOIN usuarios u ON c.usuario_id = u.id
             WHERE c.numero_cuenta = ?
             FOR UPDATE`,
            [numero_cuenta_destino]
        );

        if (destinos.length === 0) {
            await conexionDB.rollback();
            return res.status(404).json({
                mensaje: 'La cuenta destino no existe'
            });
        }

        const destino = destinos[0];

        // Verificar que el titular de destino esté activo
        if (destino.estado !== 'activo') {
            await conexionDB.rollback();
            return res.status(403).json({
                mensaje: 'La cuenta destino se encuentra bloqueada'
            });
        }

        // Evitar transferencias a la misma cuenta
        if (origen.id === destino.id) {
            await conexionDB.rollback();
            return res.status(400).json({
                mensaje: 'No puedes transferir a tu misma cuenta'
            });
        }

        // Verificar saldo suficiente
        if (Number(origen.saldo) < valor) {
            await conexionDB.rollback();
            return res.status(400).json({
                mensaje: 'No tienes saldo suficiente'
            });
        }

        // Calcular los nuevos saldos
        const saldoOrigen = Number(origen.saldo) - valor;
        const saldoDestino = Number(destino.saldo) + valor;

        // Actualizar saldo de origen
        await conexionDB.execute(
            'UPDATE cuentas SET saldo = ? WHERE id = ?',
            [saldoOrigen, origen.id]
        );

        // Actualizar saldo de destino
        await conexionDB.execute(
            'UPDATE cuentas SET saldo = ? WHERE id = ?',
            [saldoDestino, destino.id]
        );

        // Registrar la transferencia
        await conexionDB.execute(
            `INSERT INTO transferencias
             (cuenta_origen_id, cuenta_destino_id, monto, descripcion)
             VALUES (?, ?, ?, ?)`,
            [
                origen.id,
                destino.id,
                valor,
                descripcion || 'Transferencia bancaria'
            ]
        );

        // Registrar movimiento de salida con saldo resultante
        await conexionDB.execute(
            `INSERT INTO movimientos
             (cuenta_id, tipo, monto, descripcion, saldo_resultante)
             VALUES (?, 'transferencia', ?, ?, ?)`,
            [
                origen.id,
                valor,
                `Transferencia enviada a ${destino.numero_cuenta}`,
                saldoOrigen
            ]
        );

        // Registrar movimiento de entrada con saldo resultante
        await conexionDB.execute(
            `INSERT INTO movimientos
             (cuenta_id, tipo, monto, descripcion, saldo_resultante)
             VALUES (?, 'deposito', ?, ?, ?)`,
            [
                destino.id,
                valor,
                `Transferencia recibida desde ${origen.numero_cuenta}`,
                saldoDestino
            ]
        );

        await conexionDB.commit();

        return res.json({
            mensaje: 'Transferencia realizada correctamente',
            cuenta_origen: origen.numero_cuenta,
            cuenta_destino: destino.numero_cuenta,
            monto: valor,
            saldo_origen: saldoOrigen,
            saldo_destino: saldoDestino
        });

    } catch (error) {
        if (conexionDB) {
            await conexionDB.rollback();
        }

        console.error('Error en transferencia:', error);

        return res.status(500).json({
            mensaje: 'Error al realizar la transferencia'
        });

    } finally {
        if (conexionDB) {
            conexionDB.release();
        }
    }
};
