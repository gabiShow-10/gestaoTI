// "Banco de dados" em memória: os dados vivem na RAM do processo Node.
// Ao reiniciar o servidor, tudo volta para os dados iniciais abaixo.
const agora = () => new Date().toISOString();

const tecnicos = [
    { id: 1, nome: 'Carlos Mendes', email: 'carlos.mendes@empresa.com', especialidade: 'REDES', status: 'ATIVO' },
    { id: 2, nome: 'Ana Souza', email: 'ana.souza@empresa.com', especialidade: 'SOFTWARE', status: 'ATIVO' },
    { id: 3, nome: 'Marcos Lima', email: 'marcos.lima@empresa.com', especialidade: 'HARDWARE', status: 'INATIVO' }
];

const chamados = [
    {
        id: 1,
        titulo: 'Sem acesso à internet',
        descricao: 'Setor financeiro sem conexão desde as 8h.',
        prioridade: 'ALTA',
        status: 'EM_ANDAMENTO',
        solicitante: 'Setor Financeiro',
        tecnicoId: 1,
        criadoEm: agora(),
        atualizadoEm: agora()
    },
    {
        id: 2,
        titulo: 'Erro ao abrir o ERP',
        descricao: 'Sistema trava na tela de login.',
        prioridade: 'CRITICA',
        status: 'ABERTO',
        solicitante: 'Setor Comercial',
        tecnicoId: 2,
        criadoEm: agora(),
        atualizadoEm: agora()
    },
    {
        id: 3,
        titulo: 'Troca de mouse',
        descricao: 'Mouse da recepção parou de funcionar.',
        prioridade: 'BAIXA',
        status: 'ABERTO',
        solicitante: 'Recepção',
        tecnicoId: null,
        criadoEm: agora(),
        atualizadoEm: agora()
    }
];

// Próximo ID livre de cada entidade (nunca reaproveita ID de registro apagado)
const contadores = { tecnico: 4, chamado: 4 };

module.exports = { tecnicos, chamados, contadores, agora };
