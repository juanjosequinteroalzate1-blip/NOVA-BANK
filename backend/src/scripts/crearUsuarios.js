
const conexion = require('../config/db');
const bcrypt = require('bcryptjs');

async function crearUsuarios() {
    const usuarios = [
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
            rol: 'cliente'
        },
        {
            nombre: 'Laura',
            apellido: 'Gomez',
            documento: '1000000003',
            correo: 'laura@novabank.com',
            telefono: '3000000003',
            password: 'Cliente123*',
            pin: '2222',
            rol: 'cliente'
        },
        {
            nombre: 'Andres',
            apellido: 'Martinez',
            documento: '1000000004',
            correo: 'andres@novabank.com',
            telefono: '3000000004',
            password: 'Cliente123*',
            pin: '3333',
            rol: 'cliente'
        }
    ];

    try {
        for (const usuario of usuarios) {
            const [existentes] = await conexion.execute(
                `SELECT id FROM usuarios
                 WHERE documento = ? OR correo = ?`,
                [usuario.documento, usuario.correo]
            );

            if (existentes.length > 0) {
                console.log(`Usuario ${usuario.correo} ya existe. Se omite.`);
                continue;
            }

            const passwordHash = await bcrypt.hash(usuario.password, 10);
            const pinHash = await bcrypt.hash(usuario.pin, 10);

            await conexion.execute(
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

            console.log(`Usuario ${usuario.correo} creado.`);
        }

        console.log('Proceso de usuarios finalizado.');

    } catch (error) {
        console.error('Error al crear usuarios:', error.message);
        process.exitCode = 1;
    } finally {
        await conexion.end();
    }
}

crearUsuarios();
