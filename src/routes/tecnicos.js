const express = require('express');
const router = express.Router();
const db = require('../db');
const { validarTecnico, maiusculo } = require('../validacoes');

const CAMPOS = ['nome', 'email', 'especialidade', 'status'];

// GET /api/v1/tecnicos -> lista todos
// GET /api/v1/tecnicos?status=ATIVO&especialidade=REDES -> filtra

router.get('/', (req, res) => {
    const { especialidade, status } = req.query;

    let lista = db.tecnicos;

    if (especialidade) {
        lista = lista.filter(
            (t) => t.especialidade === maiusculo(especialidade)
        );
    }

    if (status) {
        lista = lista.filter(
            (t) => t.status === maiusculo(status)
        );
    }

    res.status(200).json(lista);
});

module.exports = router;
