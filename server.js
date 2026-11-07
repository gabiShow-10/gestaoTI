const express = require('express');
const app = express();
const PORT = process.env.PORT || 3014;

// Importar rotas
const tecnicosRouter = require('./src/routes/tecnicos');
const chamadosRouter = require('./src/routes/chamados');

// Middleware
app.use(express.json());

// Rota de saúde da API
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        servico: 'API de Chamados de Suporte T.I.',
        timestamp: new Date()
    });
});

// Rota de técnicos
app.use('/api/v1/tecnicos', tecnicosRouter);

// Rota de chamados
app.use('/api/v1/chamados', chamadosRouter);

// Rota inexistente -> 404 em JSON
app.use((req, res) => {
    res.status(404).json({
        erro: 'Rota nao encontrada.'
    });
});

// Tratamento de erros: JSON malformado -> 400, qualquer outro -> 500
app.use((err, req, res, next) => {
    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        'body' in err
    ) {
        return res.status(400).json({
            erro: 'JSON malformado no corpo da requisicao.'
        });
    }

    console.error(err);

    res.status(500).json({
        erro: 'Erro interno do servidor.'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`[Chamados T.I.] API rodando na porta ${PORT}`);
});
