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

// POST /api/v1/chamados
router.post('/', (req, res) => {
    const body = req.body || {};

    const erros = validarChamado(body);

    if (erros.length > 0) {
        return res.status(400).json({
            erro: 'Payload invalido.',
            detalhes: erros
        });
    }

    const tecnicoId = body.tecnicoId === undefined ? null : body.tecnicoId;

    if (tecnicoId !== null && !tecnicoExiste(tecnicoId)) {
        return res.status(404).json({
            erro: 'Tecnico informado em tecnicoId nao encontrado.'
        });
    }

    const agora = db.agora();

    const novo = {
        id: db.contadores.chamado++,
        titulo: body.titulo.trim(),
        descricao: body.descricao.trim(),
        prioridade: maiusculo(body.prioridade),
        solicitante: body.solicitante.trim(),
        status: body.status ? maiusculo(body.status) : 'ABERTO',
        tecnicoId,
        criadoEm: agora,
        atualizadoEm: agora
    };

    db.chamados.push(novo);

    res.status(201).json(novo);
});

module.exports = router;
