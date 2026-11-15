
const conexion = require('../config/db');

// Consultar las cuentas del usuario autenticado
exports.obtenerCuentas = async (req, res) => {
    try {
        const usuarioId = req.session.usuario.id;

        const [cuentas] = await conexion.execute(
            `SELECT id, numero_cuenta, tipo_cuenta, saldo, fecha_creacion
             FROM cuentas
             WHERE usuario_id = ?
             ORDER BY fecha_creacion DESC`,
            [usuarioId]
        );

        res.json({
            mensaje: 'Cuentas consultadas correctamente',
            cuentas: cuentas
        });

    } catch (error) {
        console.error('Error al consultar cuentas:', error);

        res.status(500).json({
            mensaje: 'Error al consultar las cuentas'
        });
    }
};
