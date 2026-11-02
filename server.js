const express = require('express');

const app = express();
const PORT = process.env.PORT || 3013;

app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    servico: 'API de Chamados de Suporte T.I.',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`[Chamados T.I.] API rodando na porta ${PORT}`);
});


