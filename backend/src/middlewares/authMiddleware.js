
// Verificar que el usuario haya iniciado sesión
exports.verificarSesion = (req, res, next) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: 'Debes iniciar sesión para continuar'
        });
    }

    next();
};

// Verificar que el usuario sea administrador
exports.soloAdmin = (req, res, next) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: 'Debes iniciar sesión'
        });
    }

    if (req.session.usuario.rol !== 'admin') {
        return res.status(403).json({
            mensaje: 'No tienes permisos de administrador'
        });
    }

    next();
};

// Verificar que el usuario sea cliente
exports.soloCliente = (req, res, next) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: 'Debes iniciar sesión'
        });
    }

    if (req.session.usuario.rol !== 'cliente') {
        return res.status(403).json({
            mensaje: 'Esta función es exclusiva para clientes'
        });
    }

    next();
};
// Verificar que exista una sesión activa del cajero
exports.verificarSesionCajero = (req, res, next) => {
    if (!req.session.cajero) {
        return res.status(401).json({
            mensaje: 'Debes ingresar primero al cajero'
        });
    }

    next();
};