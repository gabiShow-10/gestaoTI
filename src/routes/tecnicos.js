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

// POST /api/v1/tecnicos
router.post('/', (req, res) => {
    const body = req.body || {};

    const erros = validarTecnico(body);

    if (erros.length > 0) {
        return res.status(400).json({
            erro: 'Payload invalido.',
            detalhes: erros
        });
    }

    const novo = {
        id: db.contadores.tecnico++,
        nome: body.nome.trim(),
        email: body.email.trim(),
        especialidade: maiusculo(body.especialidade),
        status: body.status ? maiusculo(body.status) : 'ATIVO'
    };

    db.tecnicos.push(novo);

    res.status(201).json(novo);
});

// PUT /api/v1/tecnicos/:id (substitui o registro inteiro)
router.put('/:id', (req, res) => {
    const tecnico = db.tecnicos.find((t) => t.id === Number(req.params.id));

    if (!tecnico) {
        return res.status(404).json({ erro: 'Tecnico nao encontrado.' });
    }

    const body = req.body || {};
    const erros = validarTecnico(body);

    if (erros.length > 0) {
        return res.status(400).json({
            erro: 'Payload invalido.',
            detalhes: erros
        });
    }

    tecnico.nome = body.nome.trim();
    tecnico.email = body.email.trim();
    tecnico.especialidade = maiusculo(body.especialidade);
    tecnico.status = body.status ? maiusculo(body.status) : 'ATIVO';

    res.status(200).json(tecnico);
});

// PATCH /api/v1/tecnicos/:id (atualiza so os campos enviados)
router.patch('/:id', (req, res) => {
    const tecnico = db.tecnicos.find(
        (t) => t.id === Number(req.params.id)
    );

    if (!tecnico) {
        return res.status(404).json({
            erro: 'Tecnico nao encontrado.'
        });
    }

    const body = req.body || {};

    const enviados = CAMPOS.filter(
        (campo) => body[campo] !== undefined
    );

    if (enviados.length === 0) {
        return res.status(400).json({
            erro: `Envie ao menos um campo para atualizar: ${CAMPOS.join(', ')}.`
        });
    }

    const erros = validarTecnico(body, true);

    if (erros.length > 0) {
        return res.status(400).json({
            erro: 'Payload invalido.',
            detalhes: erros
        });
    }

    if (body.nome !== undefined) {
        tecnico.nome = body.nome.trim();
    }

    if (body.email !== undefined) {
        tecnico.email = body.email.trim();
    }

    if (body.especialidade !== undefined) {
        tecnico.especialidade = maiusculo(body.especialidade);
    }

    if (body.status !== undefined) {
        tecnico.status = maiusculo(body.status);
    }

    res.status(200).json(tecnico);
});

// DELETE /api/v1/tecnicos/:id
router.delete('/:id', (req, res) => {
    const indice = db.tecnicos.findIndex(
        (t) => t.id === Number(req.params.id)
    );

    if (indice === -1) {
        return res.status(404).json({
            erro: 'Tecnico nao encontrado.'
        });
    }

    const [removido] = db.tecnicos.splice(indice, 1);

    res.status(200).json({
        mensagem: 'Tecnico removido com sucesso.',
        tecnico: removido
    });
});

module.exports = router;
