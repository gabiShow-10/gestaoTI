const express = require('express');

const app = express();
<<<<<<< HEAD
const PORT = process.env.PORT || 3013;
=======
const PORT = process.env.PORT || 3014;
>>>>>>> cefafed (Adiciona configuração do banco de dados)

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
<<<<<<< HEAD


=======
>>>>>>> cefafed (Adiciona configuração do banco de dados)
