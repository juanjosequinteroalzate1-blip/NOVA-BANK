
const conexion = require('../config/db');
const bcrypt = require('bcryptjs');

// Consultar todos los clientes registrados
exports.obtenerClientes = async (req, res) => {
    try {
        const [clientes] = await conexion.execute(
            `SELECT 
                u.id,
                u.nombre,
                u.apellido,
                u.correo,
                u.estado,
                COUNT(c.id) AS cantidad_cuentas
            FROM usuarios u
            LEFT JOIN cuentas c ON c.usuario_id = u.id
            WHERE u.rol = 'cliente'
            GROUP BY 
                u.id,
                u.nombre,
                u.apellido,
                u.correo,
                u.estado
            ORDER BY u.id DESC`
        );

        res.json({
            mensaje: 'Clientes consultados correctamente',
            total: clientes.length,
            clientes
        });

    } catch (error) {
        console.error('Error al consultar clientes:', error);

        res.status(500).json({
            mensaje: 'Error al consultar los clientes'
        });
    }
};


// Editar información de un cliente
exports.editarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, correo, telefono } = req.body;

        if (!nombre || !apellido || !correo) {
            return res.status(400).json({
                mensaje: 'Nombre, apellido y correo son obligatorios'
            });
        }

        const [resultado] = await conexion.execute(
            `UPDATE usuarios
             SET nombre = ?, apellido = ?, correo = ?, telefono = ?
             WHERE id = ? AND rol = 'cliente'`,
            [nombre, apellido, correo, telefono || null, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        return res.json({
            mensaje: 'Información del cliente actualizada correctamente'
        });

    } catch (error) {
        console.error('Error al editar cliente:', error);

        return res.status(500).json({
            mensaje: 'Error al actualizar la información del cliente'
        });
    }
};

// Cambiar el estado de un cliente (activar o bloquear)
exports.cambiarEstadoCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        // Validar el estado recibido
        if (!['activo', 'bloqueado'].includes(estado)) {
            return res.status(400).json({
                mensaje: 'El estado debe ser activo o bloqueado'
            });
        }

        // Verificar que el cliente exista
        const [clientes] = await conexion.execute(
            `SELECT id, nombre, estado
             FROM usuarios
             WHERE id = ? AND rol = 'cliente'`,
            [id]
        );

        if (clientes.length === 0) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        // Actualizar el estado
        await conexion.execute(
            `UPDATE usuarios
             SET estado = ?
             WHERE id = ? AND rol = 'cliente'`,
            [estado, id]
        );

        return res.json({
            mensaje: estado === 'bloqueado'
                ? 'Cliente bloqueado correctamente'
                : 'Cliente activado correctamente',
            cliente: {
                id: clientes[0].id,
                nombre: clientes[0].nombre,
                estado: estado
            }
        });

    } catch (error) {
        console.error('Error al cambiar estado del cliente:', error);

        return res.status(500).json({
            mensaje: 'Error al cambiar el estado del cliente'
        });
    }
};

// Buscar clientes por nombre, apellido, documento o correo
exports.buscarClientes = async (req, res) => {
    try {
        const { busqueda } = req.query;

        if (!busqueda || !busqueda.trim()) {
            return res.status(400).json({
                mensaje: 'Debes ingresar un dato para buscar'
            });
        }

        const termino = `%${busqueda.trim()}%`;

        const [clientes] = await conexion.execute(
            `SELECT
                id,
                nombre,
                apellido,
                documento,
                correo,
                telefono,
                estado
             FROM usuarios
             WHERE rol = 'cliente'
             AND (
                nombre LIKE ?
                OR apellido LIKE ?
                OR documento LIKE ?
                OR correo LIKE ?
             )
             ORDER BY nombre ASC`,
            [termino, termino, termino, termino]
        );

        return res.json({
            mensaje: 'Búsqueda de clientes realizada correctamente',
            clientes
        });

    } catch (error) {
        console.error('Error al buscar clientes:', error);

        return res.status(500).json({
            mensaje: 'Error al buscar clientes'
        });
    }
};

// Consultar información detallada de un cliente
exports.obtenerClientePorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [clientes] = await conexion.execute(
            `SELECT
                u.id,
                u.nombre,
                u.apellido,
                u.documento,
                u.correo,
                u.telefono,
                u.estado
             FROM usuarios u
             WHERE u.id = ?
             AND u.rol = 'cliente'`,
            [id]
        );

        if (clientes.length === 0) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        const [cuentas] = await conexion.execute(
            `SELECT id, numero_cuenta, tipo_cuenta, saldo, fecha_creacion
             FROM cuentas
             WHERE usuario_id = ?`,
            [id]
        );

        return res.json({
            mensaje: 'Información del cliente consultada correctamente',
            cliente: clientes[0],
            cuentas
        });

    } catch (error) {
        console.error('Error al consultar el cliente:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar la información del cliente'
        });
    }
};

// CONSULTAR TODAS LAS CUENTAS BANCARIAS
exports.obtenerCuentas = async (req, res) => {
    try {
        const [cuentas] = await conexion.execute(
            `SELECT
                c.id,
                c.numero_cuenta,
                c.tipo_cuenta,
                c.saldo,
                u.nombre,
                u.apellido,
                u.correo
            FROM cuentas c
            INNER JOIN usuarios u ON c.usuario_id = u.id
            ORDER BY c.id DESC`
        );

        res.json({
            mensaje: 'Cuentas bancarias consultadas correctamente',
            total: cuentas.length,
            cuentas
        });

    } catch (error) {
        console.error('Error al consultar cuentas:', error);

        res.status(500).json({
            mensaje: 'Error al consultar las cuentas bancarias'
        });
    }
};

// Consultar el historial general de movimientos del banco
exports.obtenerMovimientos = async (req, res) => {
    try {
        const [movimientos] = await conexion.execute(
            `SELECT
                m.id,
                m.tipo,
                m.monto,
                m.descripcion,
                m.fecha,
                c.numero_cuenta,
                u.nombre,
                u.apellido,
                u.correo
            FROM movimientos m
            INNER JOIN cuentas c ON m.cuenta_id = c.id
            INNER JOIN usuarios u ON c.usuario_id = u.id
            ORDER BY m.fecha DESC`
        );

        res.json({
            mensaje: 'Historial general consultado correctamente',
            total: movimientos.length,
            movimientos
        });

    } catch (error) {
        console.error('Error al consultar movimientos:', error);

        res.status(500).json({
            mensaje: 'Error al consultar el historial general'
        });
    }
};

 // Consultar resumen general del banco
exports.obtenerResumen = async (req, res) => {
    try {
        const [resumen] = await conexion.execute(
            `SELECT
    (SELECT COUNT(*)
     FROM usuarios
     WHERE rol = 'cliente') AS total_clientes,

    (SELECT COUNT(*)
     FROM usuarios
     WHERE rol = 'cliente'
     AND estado = 'activo') AS clientes_activos,

    (SELECT COUNT(*)
     FROM usuarios
     WHERE rol = 'cliente'
     AND estado = 'bloqueado') AS clientes_bloqueados,

    (SELECT COUNT(*)
     FROM cuentas c
     INNER JOIN usuarios u ON c.usuario_id = u.id
     WHERE u.rol = 'cliente'
     AND u.estado = 'activo') AS cuentas_activas,

    (SELECT COUNT(*) FROM cuentas) AS total_cuentas,

    (SELECT COALESCE(SUM(saldo), 0)
     FROM cuentas) AS dinero_total,

    (SELECT COUNT(*) FROM movimientos) AS total_movimientos`
        );

        res.json({
            mensaje: 'Resumen general consultado correctamente',
            resumen: resumen[0]
        });

    } catch (error) {
        console.error('Error al consultar resumen:', error);

        res.status(500).json({
            mensaje: 'Error al consultar el resumen general'
        });
    }
};

// Registrar un nuevo cliente desde administración
exports.registrarCliente = async (req, res) => {
    let conexionDB;

    try {
        const {
            nombre,
            apellido,
            documento,
            correo,
            telefono,
            password,
            pin
        } = req.body;

        // Validar los campos obligatorios
        if (!nombre || !apellido || !documento || !correo || !password || !pin) {
            return res.status(400).json({
                mensaje: 'Debes completar todos los campos obligatorios'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                mensaje: 'La contraseña debe tener mínimo 8 caracteres'
            });
        }

        if (!/^\d{4}$/.test(String(pin))) {
            return res.status(400).json({
                mensaje: 'El PIN debe tener exactamente 4 números'
            });
        }

        // Proteger contraseña y PIN
        const passwordHash = await bcrypt.hash(password, 10);
        const pinHash = await bcrypt.hash(String(pin), 10);

        // Obtener una conexión para realizar la transacción
        conexionDB = await conexion.getConnection();

        await conexionDB.beginTransaction();

        // Comprobar si el documento o correo ya existen
        const [usuariosExistentes] = await conexionDB.execute(
            'SELECT id FROM usuarios WHERE correo = ? OR documento = ?',
            [correo, documento]
        );

        if (usuariosExistentes.length > 0) {
            await conexionDB.rollback();

            return res.status(409).json({
                mensaje: 'El correo o documento ya se encuentra registrado'
            });
        }

        // Crear el cliente
        const [resultado] = await conexionDB.execute(
            `INSERT INTO usuarios
            (nombre, apellido, documento, correo, telefono, password, pin, rol, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'cliente', 'activo')`,
            [
                nombre,
                apellido,
                documento,
                correo,
                telefono || null,
                passwordHash,
                pinHash
            ]
        );

        // Generar un número de cuenta único
        let numeroCuenta;
        let cuentaExiste = true;

        while (cuentaExiste) {
            numeroCuenta = '10' + Date.now().toString().slice(-10);

            const [cuentasExistentes] = await conexionDB.execute(
                'SELECT id FROM cuentas WHERE numero_cuenta = ?',
                [numeroCuenta]
            );

            cuentaExiste = cuentasExistentes.length > 0;
        }

        // Crear automáticamente una cuenta de ahorros con saldo cero
        const [resultadoCuenta] = await conexionDB.execute(
            `INSERT INTO cuentas
            (usuario_id, numero_cuenta, tipo_cuenta, saldo)
            VALUES (?, ?, 'ahorros', 0.00)`,
            [resultado.insertId, numeroCuenta]
        );

        // Confirmar ambas operaciones
        await conexionDB.commit();

        return res.status(201).json({
            mensaje: 'Cliente y cuenta bancaria registrados correctamente',
            cliente: {
                id: resultado.insertId,
                nombre,
                apellido,
                documento,
                correo,
                telefono: telefono || null,
                rol: 'cliente',
                estado: 'activo'
            },
            cuenta: {
                id: resultadoCuenta.insertId,
                numero_cuenta: numeroCuenta,
                tipo_cuenta: 'ahorros',
                saldo: 0
            }
        });

    } catch (error) {
        if (conexionDB) {
            await conexionDB.rollback();
        }

        console.error('Error al registrar cliente:', error);

        return res.status(500).json({
            mensaje: 'Error al registrar el cliente y su cuenta bancaria'
        });

    } finally {
        if (conexionDB) {
            conexionDB.release();
        }
    }
};


 // Abrir una cuenta bancaria para un cliente
exports.abrirCuenta = async (req, res) => {
    const { documento, tipo_cuenta, saldo_inicial } = req.body;

    const saldo = Number(saldo_inicial);

    if (!documento || !['ahorros', 'corriente'].includes(tipo_cuenta)) {
        return res.status(400).json({
            mensaje: 'Debes indicar un documento y un tipo de cuenta válido'
        });
    }

    if (!Number.isFinite(saldo) || saldo < 0) {
        return res.status(400).json({
            mensaje: 'El saldo inicial debe ser un valor válido y no negativo'
        });
    }

    let conexionDB;

    try {
        conexionDB = await conexion.getConnection();
        await conexionDB.beginTransaction();

        // Buscar al cliente por su documento
        const [usuarios] = await conexionDB.execute(
            `SELECT id, nombre, apellido
             FROM usuarios
             WHERE documento = ? AND rol = 'cliente'
             FOR UPDATE`,
            [documento]
        );

        if (usuarios.length === 0) {
            await conexionDB.rollback();

            return res.status(404).json({
                mensaje: 'No se encontró un cliente con ese documento'
            });
        }

        const usuario = usuarios[0];

        // Generar un número de cuenta único
        let numeroCuenta;
        let cuentaExiste = true;

        while (cuentaExiste) {
            numeroCuenta = '10' + Date.now().toString().slice(-10);

            const [existentes] = await conexionDB.execute(
                'SELECT id FROM cuentas WHERE numero_cuenta = ?',
                [numeroCuenta]
            );

            cuentaExiste = existentes.length > 0;
        }

        // Crear la cuenta bancaria
        const [resultado] = await conexionDB.execute(
            `INSERT INTO cuentas
            (usuario_id, numero_cuenta, tipo_cuenta, saldo)
            VALUES (?, ?, ?, ?)`,
            [usuario.id, numeroCuenta, tipo_cuenta, saldo]
        );

        // Registrar el depósito inicial si es mayor que cero
        if (saldo > 0) {
            await conexionDB.execute(
                `INSERT INTO movimientos
                (cuenta_id, tipo, monto, descripcion)
                VALUES (?, 'deposito', ?, ?)`,
                [
                    resultado.insertId,
                    saldo,
                    'Deposito inicial de apertura de cuenta'
                ]
            );
        }

        await conexionDB.commit();

        return res.status(201).json({
            mensaje: 'Cuenta bancaria creada correctamente',
            cuenta: {
                id: resultado.insertId,
                titular: `${usuario.nombre} ${usuario.apellido}`,
                numero_cuenta: numeroCuenta,
                tipo_cuenta,
                saldo
            }
        });

    } catch (error) {
        if (conexionDB) {
            await conexionDB.rollback();
        }

        console.error('Error al abrir cuenta:', error);

        return res.status(500).json({
            mensaje: 'Error al abrir la cuenta bancaria'
        });

    } finally {
        if (conexionDB) {
            conexionDB.release();
        }
    }
};

 // Bloquear o activar un cliente
exports.cambiarEstadoCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        // Validar el estado solicitado
        if (!['activo', 'bloqueado'].includes(estado)) {
            return res.status(400).json({
                mensaje: 'El estado debe ser activo o bloqueado'
            });
        }

        // Comprobar que el cliente exista
        const [clientes] = await conexion.execute(
            `SELECT id, nombre, apellido, estado
             FROM usuarios
             WHERE id = ? AND rol = 'cliente'`,
            [id]
        );

        if (clientes.length === 0) {
            return res.status(404).json({
                mensaje: 'No se encontró el cliente'
            });
        }

        // Actualizar el estado
        await conexion.execute(
            `UPDATE usuarios
             SET estado = ?
             WHERE id = ? AND rol = 'cliente'`,
            [estado, id]
        );

        return res.json({
            mensaje: estado === 'bloqueado'
                ? 'Cliente bloqueado correctamente'
                : 'Cliente activado correctamente',
            cliente: {
                id: clientes[0].id,
                nombre: clientes[0].nombre,
                apellido: clientes[0].apellido,
                estado
            }
        });

    } catch (error) {
        console.error('Error al cambiar estado del cliente:', error);

        return res.status(500).json({
            mensaje: 'Error al cambiar el estado del cliente'
        });
    }
};
