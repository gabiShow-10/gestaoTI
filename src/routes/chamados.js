const express = require('express');
const router = express.Router();
const db = require('../db');
const { validarChamado, maiusculo } = require('../validacoes');

const CAMPOS = [
    'titulo',
    'descricao',
    'prioridade',
    'solicitante',
    'status',
    'tecnicoId'
];

const tecnicoExiste = (id) => db.tecnicos.some((t) => t.id === id);

// GET /api/v1/chamados
// GET /api/v1/chamados?status=ABERTO&prioridade=ALTA&tecnicoId=1 -> filtra

router.get('/', (req, res) => {
    const { status, prioridade, tecnicoId } = req.query;

    let lista = db.chamados;

    if (status) {
        lista = lista.filter(
            (c) => c.status === maiusculo(status)
        );
    }

    if (prioridade) {
        lista = lista.filter(
            (c) => c.prioridade === maiusculo(prioridade)
        );
    }

    if (tecnicoId) {
        lista = lista.filter(
            (c) => c.tecnicoId === Number(tecnicoId)
        );
    }

    res.status(200).json(lista);
});

// GET /api/v1/chamados/:id
router.get('/:id', (req, res) => {
    const chamado = db.chamados.find(
        (c) => c.id === Number(req.params.id)
    );

    if (!chamado) {
        return res.status(404).json({
            erro: 'Chamado nao encontrado.'
        });
    }

    res.status(200).json(chamado);
});

module.exports = router;
