
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

require('dotenv').config({
    path: path.join(__dirname, '../../.env')
});

const conexion = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const privadasRoutes = require('./routes/privadasRoutes');
const cuentasRoutes = require('./routes/cuentasRoutes');
const movimientosRoutes = require('./routes/movimientosRoutes');
const transferenciasRoutes = require('./routes/transferenciasRoutes');
const depositosRoutes = require('./routes/depositosRoutes');
const retirosRoutes = require('./routes/retirosRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cajeroRoutes = require('./routes/cajeroRoutes');

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

// Configuración de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60
    }
}));

// Servir archivos del frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Comprobar conexión con MySQL
app.get('/api/estado', async (req, res) => {
    try {
        const [resultado] = await conexion.query('SELECT 1 AS conexion');

        res.json({
            servidor: 'Conectado',
            baseDatos: resultado[0].conexion === 1
                ? 'Conectada'
                : 'Error'
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al conectar con la base de datos'
        });
    }
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/privadas', privadasRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/transferencias', transferenciasRoutes);
app.use('/api/depositos', depositosRoutes);
app.use('/api/retiros', retirosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cajero', cajeroRoutes);

const PUERTO = process.env.PORT || 3000;

app.listen(PUERTO, () => {
    console.log(`NOVA BANK ejecutándose en http://localhost:${PUERTO}`);
});
