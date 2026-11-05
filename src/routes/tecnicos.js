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

// GET /api/v1/tecnicos/:id
router.get('/:id', (req, res) => {
    const tecnico = db.tecnicos.find(
        (t) => t.id === Number(req.params.id)
    );

    if (!tecnico) {
        return res.status(404).json({
            erro: 'Tecnico nao encontrado.'
        });
    }

    res.status(200).json(tecnico);
});

module.exports = router;
