# gestaoTI — Sistema de Chamados de Suporte T.I.

**Projeto Final Integrador — Back-End 1 (PBE1) — SENAI / Binário Tech**

| | |
|---|---|
| **Dupla** | Gabriel Barbosa Silva e Talyson Morgado Almeida da Silva |
| **Tema** | 5 — Sistema de Chamados de Suporte T.I. |
| **Entidades** | `Tecnicos` e `Chamados` |
| **Stack** | Node.js, Express 4, Bash (`curl` + `jq`), Git/GitHub, Linux Debian |

## Sobre o projeto

Toda empresa tem um setor de T.I. que recebe pedidos de ajuda: internet fora do ar, sistema travado, impressora com defeito. Cada pedido vira um **chamado**, e cada chamado pode ser atendido por um **técnico**.

Este projeto é uma API RESTful que organiza esse processo. Com ela é possível:

- cadastrar, consultar, alterar e remover **técnicos** (nome, e-mail, especialidade e se está ativo);
- abrir, consultar, alterar e remover **chamados** (título, descrição, prioridade, status e solicitante);
- atribuir um chamado a um técnico, acompanhar o andamento (`ABERTO`, `EM_ANDAMENTO`, `RESOLVIDO`, `FECHADO`) e filtrar as listagens (por exemplo, só os chamados abertos ou só os de prioridade alta).

**Relação entre as duas entidades:** um técnico atende vários chamados, e cada chamado guarda o `tecnicoId` do técnico responsável. Se o técnico é removido, os chamados dele ficam sem responsável.

Os dados ficam **em memória** (arrays no processo Node), como nas aulas. Ao reiniciar o servidor, tudo volta aos dados iniciais definidos em `src/db.js`.

O projeto também tem um **script de automação em Bash** (`testes_automacao.sh`) que testa todas as rotas e gera um log de auditoria (`resultado_execucao.log`).

## Como executar

Requisitos: Linux (Debian), Node.js, npm, git, curl e jq.

```bash
sudo apt update && sudo apt install -y curl jq git     # só se faltar algum
```

**1. Baixar o projeto**

```bash
git clone https://github.com/gabiShow-10/gestaoTI.git
cd gestaoTI
```

**2. Instalar as dependências** (obrigatório depois do clone, porque o `node_modules` não vai para o Git)

```bash
npm install
```

**3. Subir o servidor**

```bash
npm start
```

Deve aparecer `[Chamados T.I.] API rodando na porta 3014`. O servidor usa a porta `3014`; para usar outra: `PORT=3050 npm start`.

Para deixar rodando em segundo plano e continuar usando o mesmo terminal, use `npm start &`.

**4. Conferir se está no ar**

```bash
curl -s http://localhost:3014/api/v1/health | jq .
```

Resultado esperado: `"status": "OK"`.

## Como testar

### Teste automático (todas as rotas)

Com o servidor rodando:

```bash
chmod +x testes_automacao.sh      # só na primeira vez
./testes_automacao.sh             # ou: npm run test:api
```

O script chama todas as rotas (GET, POST, PUT, PATCH e DELETE das duas entidades) e também os casos de erro (`400` e `404`). Para cada chamada ele mostra a resposta formatada com `jq`, confere o código HTTP esperado e marca `[PASSOU]` ou `[FALHOU]`.

No final aparece o resumo:

```
 RESULTADO: 48 passaram | 0 falharam
```

Tudo que aparece na tela também é gravado em `resultado_execucao.log`. Para ver o final do log:

```bash
tail -20 resultado_execucao.log
```

O script cria os próprios registros de teste e apaga no fim, então pode ser executado várias vezes seguidas. Se o servidor estiver em outra porta, rode `PORT=3050 ./testes_automacao.sh`. Se o servidor estiver parado, o script avisa `[ERRO] Servidor fora do ar`.

> Rode o script com `./` ou `bash`, nunca com `sh` (no Debian o `sh` não entende todos os comandos do script).

### Teste manual (exemplos)

Listar e filtrar:

```bash
curl -s http://localhost:3014/api/v1/tecnicos | jq .
curl -s "http://localhost:3014/api/v1/chamados?status=ABERTO" | jq .
```

Abrir um chamado (`201 Created`):

```bash
curl -i -X POST http://localhost:3014/api/v1/chamados \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Impressora travada","descricao":"Papel enroscado","prioridade":"media","solicitante":"RH","tecnicoId":1}'
```

Dado inválido (`400 Bad Request`):

```bash
curl -i -X POST http://localhost:3014/api/v1/chamados \
  -H "Content-Type: application/json" \
  -d '{"descricao":"sem titulo"}'
```

ID que não existe (`404 Not Found`):

```bash
curl -i http://localhost:3014/api/v1/chamados/999
```

Atualizar só o status (`PATCH`, 200):

```bash
curl -s -X PATCH http://localhost:3014/api/v1/chamados/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"RESOLVIDO"}' | jq .
```

Apagar (`DELETE`): 200 na primeira vez e 404 na segunda.

```bash
curl -i -X DELETE http://localhost:3014/api/v1/chamados/3
curl -i -X DELETE http://localhost:3014/api/v1/chamados/3
```

## Endpoints

| Método | Endpoint | Parâmetros | Descrição |
|---|---|---|---|
| GET | `/api/v1/health` | — | Verifica se a API está no ar |
| GET | `/api/v1/tecnicos` | query (opcionais): `especialidade`, `status` | Lista técnicos, com filtros opcionais |
| GET | `/api/v1/tecnicos/:id` | path: `id` | Busca técnico por ID |
| POST | `/api/v1/tecnicos` | body: `nome`, `email`, `especialidade`; opcional: `status` | Cadastra técnico |
| PUT | `/api/v1/tecnicos/:id` | path: `id`; body: `nome`, `email`, `especialidade`; opcional: `status` | Substitui o técnico inteiro |
| PATCH | `/api/v1/tecnicos/:id` | path: `id`; body: ao menos um entre `nome`, `email`, `especialidade`, `status` | Atualiza só os campos enviados |
| DELETE | `/api/v1/tecnicos/:id` | path: `id` | Remove o técnico e desvincula seus chamados |
| GET | `/api/v1/chamados` | query (opcionais): `status`, `prioridade`, `tecnicoId` | Lista chamados, com filtros opcionais |
| GET | `/api/v1/chamados/:id` | path: `id` | Busca chamado por ID |
| POST | `/api/v1/chamados` | body: `titulo`, `descricao`, `prioridade`, `solicitante`; opcionais: `status`, `tecnicoId` | Abre chamado |
| PUT | `/api/v1/chamados/:id` | path: `id`; body: `titulo`, `descricao`, `prioridade`, `solicitante`; opcionais: `status`, `tecnicoId` | Substitui o chamado inteiro |
| PATCH | `/api/v1/chamados/:id` | path: `id`; body: ao menos um entre `titulo`, `descricao`, `prioridade`, `solicitante`, `status`, `tecnicoId` | Atualiza só os campos enviados |
| DELETE | `/api/v1/chamados/:id` | path: `id` | Remove o chamado |

### Códigos HTTP

| Código | Quando |
|---|---|
| `200 OK` | Consultas, PUT, PATCH e DELETE bem-sucedidos |
| `201 Created` | POST bem-sucedido |
| `400 Bad Request` | Campo obrigatório ausente ou inválido, PATCH sem campos, JSON malformado |
| `404 Not Found` | ID inexistente, `tecnicoId` que não existe ou rota inexistente |

## Modelo de dados

### Técnico

| Campo | Tipo | Regra |
|---|---|---|
| `id` | número | gerado pelo servidor |
| `nome` | texto | obrigatório, não vazio |
| `email` | texto | obrigatório, precisa conter `@` |
| `especialidade` | texto | obrigatória (ex: `REDES`, `SOFTWARE`, `HARDWARE`), guardada em maiúsculo |
| `status` | texto | `ATIVO` (padrão) ou `INATIVO` |

### Chamado

| Campo | Tipo | Regra |
|---|---|---|
| `id` | número | gerado pelo servidor |
| `titulo` | texto | obrigatório, não vazio |
| `descricao` | texto | obrigatória |
| `solicitante` | texto | obrigatório |
| `prioridade` | texto | obrigatória: `BAIXA`, `MEDIA`, `ALTA` ou `CRITICA` |
| `status` | texto | `ABERTO` (padrão), `EM_ANDAMENTO`, `RESOLVIDO` ou `FECHADO` |
| `tecnicoId` | número ou `null` | opcional; se informado, o técnico precisa existir |
| `criadoEm` | data (ISO) | gerado pelo servidor |
| `atualizadoEm` | data (ISO) | atualizado a cada alteração |

## Regras de negócio e validações

- Os IDs vêm de um contador (`db.contadores`), então o ID de um registro apagado nunca é reaproveitado.
- `prioridade`, `status` e `especialidade` aceitam minúsculas na requisição e são guardados em maiúsculo.
- Campos de texto obrigatórios não podem ser vazios nem conter só espaços.
- **PUT** substitui o registro inteiro e exige todos os campos obrigatórios. **PATCH** altera só os campos enviados e exige pelo menos um campo válido.
- Chamado com `tecnicoId` que não existe (no POST, PUT ou PATCH) retorna `404`.
- Ao **excluir um técnico**, os chamados dele ficam sem responsável (`tecnicoId: null`) e os que estavam `EM_ANDAMENTO` voltam para `ABERTO`. A resposta informa quantos foram desvinculados (`chamadosDesvinculados`).
- Rota inexistente retorna `404` e JSON malformado retorna `400`, ambos em JSON.

## Exemplo de resposta

Abrir chamado (`201 Created`):

```json
{
  "id": 4,
  "titulo": "Impressora travada",
  "descricao": "Papel enroscado",
  "prioridade": "MEDIA",
  "solicitante": "RH",
  "status": "ABERTO",
  "tecnicoId": 1,
  "criadoEm": "2026-11-02T14:13:03.247Z",
  "atualizadoEm": "2026-11-02T14:13:03.247Z"
}
```

Payload inválido (`400 Bad Request`):

```json
{
  "erro": "Payload invalido.",
  "detalhes": [
    "'nome' é obrigatório e deve ser um texto não vazio.",
    "'email' é obrigatório e deve conter '@'.",
    "'especialidade' é obrigatória."
  ]
}
```

## Estrutura do projeto

```
gestaoTI/
├── server.js                # servidor Express, health check e tratamento de erros
├── package.json
├── testes_automacao.sh      # testes de todas as rotas (curl + jq)
├── resultado_execucao.log   # log de auditoria da última execução dos testes
├── README.md
└── src/
    ├── db.js                # dados em memória e contadores de ID
    ├── validacoes.js        # validação dos payloads
    └── routes/
        ├── tecnicos.js      # CRUD de técnicos
        └── chamados.js      # CRUD de chamados
```

## Gerenciamento de processos (Linux Debian)

```bash
npm start &                          # sobe o servidor em background
ps aux | grep '[n]ode server.js'     # localiza o processo (o PID é a 2ª coluna)
ss -tlnp | grep 3014                 # confirma quem está ouvindo a porta
kill -9 <PID>                        # encerra o processo
ps aux | grep '[n]ode server.js'     # confere que não sobrou nada
```

O `npm start` gera mais de uma linha no `ps` (`npm`, `sh -c` e `node server.js`). Para encerrar tudo de uma vez: `pkill -f "node server.js"`.

## Problemas comuns

| Problema | O que fazer |
|---|---|
| `EADDRINUSE` ao subir | A porta já está em uso: `ss -tlnp \| grep 3014` e `kill -9 <PID>`, ou subir em outra porta com `PORT=3050 npm start` |
| `Cannot find module 'express'` | Faltou o `npm install` |
| `jq: command not found` | `sudo apt install -y jq` |
| Script: `Permission denied` | `chmod +x testes_automacao.sh` |
| Script: `[ERRO] Servidor fora do ar` | Subir o servidor (`npm start`) e usar a mesma porta no script |
| Script: `bad interpreter` ou `^M` | Fim de linha do Windows: `sed -i 's/\r$//' testes_automacao.sh` |

## Fluxo de trabalho da dupla (Git)

- Os dois integrantes trabalharam no mesmo repositório, na branch `main`, com commits alternados.
- Antes de cada commit: `git pull --rebase origin main`. Depois: `git pull --rebase origin main && git push origin main`.
- Mensagens no padrão `tipo: descrição` (`feat`, `test`, `docs`, `chore`).
- Para conferir a divisão dos commits: `git shortlog -sn` e `git log --oneline`.

## Autores

- Gabriel Barbosa Silva — GitHub: `@gabiShow-10` e `@shex3`
- Talyson Morgado Almeida da Silva — GitHub: `@oT14lysonMorgs`
