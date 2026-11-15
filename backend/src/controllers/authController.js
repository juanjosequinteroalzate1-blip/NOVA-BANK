
const conexion = require('../config/db');
const bcrypt = require('bcryptjs');

// Iniciar sesión
exports.login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({
                mensaje: 'Debes ingresar el correo y la contraseña'
            });
        }

        const [usuarios] = await conexion.execute(
            `SELECT id, nombre, apellido, correo, password, rol, estado
             FROM usuarios
             WHERE correo = ?
             LIMIT 1`,
            [correo]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        const usuario = usuarios[0];

        const passwordValida = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordValida) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        if (usuario.estado !== 'activo') {
            return res.status(403).json({
                mensaje: 'Tu usuario se encuentra bloqueado'
            });
        }

        req.session.usuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            rol: usuario.rol
        };

        return res.json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: req.session.usuario
        });

    } catch (error) {
        console.error('Error en el login:', error);

        return res.status(500).json({
            mensaje: 'Error interno al iniciar sesión'
        });
    }
};

// Consultar sesión
// Consultar información personal del usuario autenticado
exports.perfil = async (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.status(401).json({
                mensaje: 'No has iniciado sesión'
            });
        }

        const usuarioId = req.session.usuario.id;

        const [usuarios] = await conexion.execute(
            `SELECT id, nombre, apellido, documento, correo, telefono, rol, estado
             FROM usuarios
             WHERE id = ?`,
            [usuarioId]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensaje: 'No se encontró el usuario'
            });
        }

        return res.json({
            mensaje: 'Información personal consultada correctamente',
            usuario: usuarios[0]
        });

    } catch (error) {
        console.error('Error al consultar perfil:', error);

        return res.status(500).json({
            mensaje: 'Error al consultar la información personal'
        });
    }
};

// Cerrar sesión
exports.logout = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'No se pudo cerrar la sesión'
            });
        }

        res.clearCookie('connect.sid');

        res.json({
            mensaje: 'Sesión cerrada correctamente'
        });
    });
};

// Actualizar información personal del cliente
exports.actualizarPerfil = async (req, res) => {
    try {
        const id = req.session.usuario.id;
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
                mensaje: 'No se pudo actualizar el perfil'
            });
        }

        // Actualizar los datos de la sesión
        req.session.usuario.nombre = nombre;
        req.session.usuario.apellido = apellido;
        req.session.usuario.correo = correo;

        return res.json({
            mensaje: 'Perfil actualizado correctamente',
            usuario: req.session.usuario
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);

        return res.status(500).json({
            mensaje: 'Error al actualizar el perfil'
        });
    }
};


// Cambiar contraseña del cliente
exports.cambiarPassword = async (req, res) => {
    try {
        const id = req.session.usuario.id;
        const { passwordActual, passwordNueva } = req.body;

        if (!passwordActual || !passwordNueva) {
            return res.status(400).json({
                mensaje: 'Debes ingresar la contraseña actual y la nueva'
            });
        }

        if (passwordNueva.length < 8) {
            return res.status(400).json({
                mensaje: 'La nueva contraseña debe tener mínimo 8 caracteres'
            });
        }

        const [usuarios] = await conexion.execute(
            `SELECT password
             FROM usuarios
             WHERE id = ? AND rol = 'cliente'`,
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensaje: 'Cliente no encontrado'
            });
        }

        const passwordCorrecta = await bcrypt.compare(
            passwordActual,
            usuarios[0].password
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                mensaje: 'La contraseña actual es incorrecta'
            });
        }

        const passwordEncriptada = await bcrypt.hash(passwordNueva, 10);

        await conexion.execute(
            `UPDATE usuarios
             SET password = ?
             WHERE id = ? AND rol = 'cliente'`,
            [passwordEncriptada, id]
        );

        return res.json({
            mensaje: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);

        return res.status(500).json({
            mensaje: 'Error al cambiar la contraseña'
        });
    }
};
