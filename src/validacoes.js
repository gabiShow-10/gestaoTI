const STATUS_TECNICO = ['ATIVO', 'INATIVO'];
const PRIORIDADES = ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'];
const STATUS_CHAMADO = ['ABERTO', 'EM_ANDAMENTO', 'RESOLVIDO', 'FECHADO'];

const texto = (v) => typeof v === 'string' && v.trim() !== '';
const maiusculo = (v) => (typeof v === 'string' ? v.trim().toUpperCase() : v);

// parcial = false -> exige todos os campos obrigatórios (POST e PUT)
// parcial = true -> valida só os campos que vieram no body (PATCH)

function validarTecnico(body, parcial = false) {
    const erros = [];
    const { nome, email, especialidade, status } = body;

    if (!parcial || nome !== undefined) {
        if (!texto(nome)) erros.push("'nome' é obrigatório e deve ser um texto não vazio.");
    }

    if (!parcial || email !== undefined) {
        if (!texto(email) || !email.includes('@')) erros.push("'email' é obrigatório e deve conter '@'.");
    }

    if (!parcial || especialidade !== undefined) {
        if (!texto(especialidade)) erros.push("'especialidade' é obrigatória.");
    }

    if (status !== undefined && !STATUS_TECNICO.includes(maiusculo(status))) {
        erros.push(`'status' deve ser um destes: ${STATUS_TECNICO.join(', ')}.`);
    }

    return erros;
}

function validarChamado(body, parcial = false) {
    const erros = [];
    const { titulo, descricao, prioridade, solicitante, status, tecnicoId } = body;

    if (!parcial || titulo !== undefined) {
        if (!texto(titulo)) erros.push("'titulo' é obrigatório e deve ser um texto não vazio.");
    }

    if (!parcial || descricao !== undefined) {
        if (!texto(descricao)) erros.push("'descricao' é obrigatória.");
    }

    if (!parcial || solicitante !== undefined) {
        if (!texto(solicitante)) erros.push("'solicitante' é obrigatório.");
    }

    if (!parcial || prioridade !== undefined) {
        if (!PRIORIDADES.includes(maiusculo(prioridade))) {
            erros.push(`'prioridade' é obrigatória e deve ser uma destas: ${PRIORIDADES.join(', ')}.`);
        }
    }

    if (status !== undefined && !STATUS_CHAMADO.includes(maiusculo(status))) {
        erros.push(`'status' deve ser um destes: ${STATUS_CHAMADO.join(', ')}.`);
    }

    if (tecnicoId !== undefined && tecnicoId !== null && !Number.isInteger(tecnicoId)) {
        erros.push("'tecnicoId' deve ser um número inteiro ou null.");
    }

    return erros;
}

module.exports = { validarTecnico, validarChamado, maiusculo };
