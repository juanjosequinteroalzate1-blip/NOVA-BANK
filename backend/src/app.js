
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const conexion = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        mensaje: 'NOVA BANK funcionando correctamente'
    });
});

app.get('/api/estado', async (req, res) => {
    try {
        const [resultado] = await conexion.query('SELECT 1 AS conexion');

        res.json({
            servidor: 'Conectado',
            baseDatos: resultado[0].conexion === 1 ? 'Conectada' : 'Error'
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al conectar con la base de datos'
        });
    }
});

const PUERTO = process.env.PORT || 3000;

app.listen(PUERTO, () => {
    console.log(`NOVA BANK ejecutándose en http://localhost:${PUERTO}`);
});
