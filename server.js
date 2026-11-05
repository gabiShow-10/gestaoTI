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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`[Chamados T.I.] API rodando na porta ${PORT}`);
});
