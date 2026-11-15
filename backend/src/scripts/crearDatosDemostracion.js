
const conexion = require('../config/db');
const bcrypt = require('bcryptjs');

// Datos exclusivos para las pruebas de NOVA BANK
const usuariosDemo = [
    {
        nombre: 'Administrador',
        apellido: 'NOVA BANK',
        documento: '1000000001',
        correo: 'admin@novabank.com',
        telefono: '3000000001',
        password: 'Admin123*',
        pin: '1234',
        rol: 'admin'
    },
    {
        nombre: 'Carlos',
        apellido: 'Ramirez',
        documento: '1000000002',
        correo: 'carlos@novabank.com',
        telefono: '3000000002',
        password: 'Cliente123*',
        pin: '1111',
        rol: 'cliente',
        numeroCuenta: '100000000001',
        tipoCuenta: 'ahorros',
        saldo: 2170010
    },
    {
        nombre: 'Laura',
        apellido: 'Gomez',
        documento: '1000000003',
        correo: 'laura@novabank.com',
        telefono: '3000000003',
        password: 'Cliente123*',
        pin: '2222',
        rol: 'cliente',
        numeroCuenta: '100000000002',
        tipoCuenta: 'ahorros',
        saldo: 2100000
    },
    {
        nombre: 'Andres',
        apellido: 'Martinez',
        documento: '1000000004',
        correo: 'andres@novabank.com',
        telefono: '3000000004',
        password: 'Cliente123*',
        pin: '3333',
        rol: 'cliente',
        numeroCuenta: '100000000003',
        tipoCuenta: 'corriente',
        saldo: 3200000
    },
    {
        nombre: 'Daniel',
        apellido: 'Torres',
        documento: '1000000005',
        correo: 'daniel@novabank.com',
        telefono: '3000000005',
        password: 'Daniel789*',
        pin: '1234',
        rol: 'cliente',
        numeroCuenta: '104600655068',
        tipoCuenta: 'ahorros',
        saldo: 279990
    }
];

async function crearDatosDemostracion() {
    let conexionBD;

    try {
        conexionBD = await conexion.getConnection();
        await conexionBD.beginTransaction();

        for (const usuario of usuariosDemo) {
            let usuarioId;

            // Buscar si el usuario ya existe
            const [existentes] = await conexionBD.execute(
                `SELECT id FROM usuarios
                 WHERE documento = ? OR correo = ?
                 LIMIT 1`,
                [usuario.documento, usuario.correo]
            );

            if (existentes.length > 0) {
                usuarioId = existentes[0].id;
                console.log(`Usuario existente: ${usuario.correo}`);
            } else {
                // Proteger contraseña y PIN
                const passwordHash = await bcrypt.hash(usuario.password, 10);
                const pinHash = await bcrypt.hash(usuario.pin, 10);

                const [resultado] = await conexionBD.execute(
                    `INSERT INTO usuarios
                    (nombre, apellido, documento, correo, telefono,
                     password, pin, rol)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        usuario.nombre,
                        usuario.apellido,
                        usuario.documento,
                        usuario.correo,
                        usuario.telefono,
                        passwordHash,
                        pinHash,
                        usuario.rol
                    ]
                );

                usuarioId = resultado.insertId;
                console.log(`Usuario creado: ${usuario.correo}`);
            }

            // Los administradores no necesitan cuenta bancaria
            if (usuario.rol !== 'cliente') {
                continue;
            }

            // Comprobar si ya tiene una cuenta
            const [cuentas] = await conexionBD.execute(
                `SELECT id FROM cuentas
                 WHERE usuario_id = ? OR numero_cuenta = ?
                 LIMIT 1`,
                [usuarioId, usuario.numeroCuenta]
            );

            if (cuentas.length > 0) {
                console.log(`Cuenta existente para: ${usuario.correo}`);
                continue;
            }

            // Crear cuenta bancaria
            const [cuentaCreada] = await conexionBD.execute(
                `INSERT INTO cuentas
                (usuario_id, numero_cuenta, tipo_cuenta, saldo)
                VALUES (?, ?, ?, ?)`,
                [
                    usuarioId,
                    usuario.numeroCuenta,
                    usuario.tipoCuenta,
                    usuario.saldo
                ]
            );

            // Registrar el saldo inicial como depósito
            await conexionBD.execute(
                `INSERT INTO movimientos
                (cuenta_id, tipo, monto, saldo_resultante, descripcion)
                VALUES (?, 'deposito', ?, ?, ?)`,
                [
                    cuentaCreada.insertId,
                    usuario.saldo,
                    usuario.saldo,
                    'Saldo inicial de demostracion'
                ]
            );

            console.log(`Cuenta creada: ${usuario.numeroCuenta}`);
        }

        await conexionBD.commit();

        console.log('\nDatos de demostracion preparados correctamente.');

    } catch (error) {
        if (conexionBD) {
            await conexionBD.rollback();
        }

        console.error('Error al preparar los datos:', error.message);
        process.exitCode = 1;

    } finally {
        if (conexionBD) {
            conexionBD.release();
        }

        await conexion.end();
    }
}

crearDatosDemostracion();
