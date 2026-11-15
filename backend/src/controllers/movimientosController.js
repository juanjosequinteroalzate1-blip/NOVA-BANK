
const conexion = require('../config/db');

// Consultar historial de movimientos del cliente
exports.obtenerMovimientos = async (req, res) => {
    try {
        const usuarioId = req.session.usuario.id;

        const [movimientos] = await conexion.execute(
            `SELECT 
                m.id,
                m.tipo,
                m.monto,
                m.descripcion,
                m.fecha,
                m.saldo_resultante,
                c.numero_cuenta
             FROM movimientos m
             INNER JOIN cuentas c ON m.cuenta_id = c.id
             WHERE c.usuario_id = ?
             ORDER BY m.fecha DESC`,
            [usuarioId]
        );

        res.json({
            mensaje: 'Historial consultado correctamente',
            movimientos: movimientos
        });

    } catch (error) {
        console.error('Error al consultar movimientos:', error);

        res.status(500).json({
            mensaje: 'Error al consultar el historial'
        });
    }
};
