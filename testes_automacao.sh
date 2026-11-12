#!/bin/bash
# ==============================================================================
# testes_automacao.sh - Testa TODAS as rotas da API de Chamados de Suporte T.I.
# Uso: ./testes_automacao.sh (o servidor precisa estar rodando)
# PORT=3050 ./testes_automacao.sh (se o servidor usa outra porta)
# Saída: tela + arquivo resultado_execucao.log (log de auditoria)
# ==============================================================================
BASE_URL="http://localhost:${PORT:-3014}/api/v1"
LOG="resultado_execucao.log"
TMP=$(mktemp)
OK=0
FALHAS=0

# chamar "descrição" MÉTODO /rota STATUS_ESPERADO ['{"json":"opcional"}']
# Faz a requisição, compara o status HTTP e mostra o corpo formatado com jq.
# O corpo da última resposta fica em $TMP (para extrair IDs com jq).
chamar() {
  local descricao="$1" metodo="$2" rota="$3" esperado="$4" dados="$5"
  local codigo
  echo ""
  echo ">>> $descricao"
  echo " $metodo $rota"

  if [ -n "$dados" ]; then
    codigo=$(curl -s -o "$TMP" -w "%{http_code}" -X "$metodo" "$BASE_URL$rota" \
    -H "Content-Type: application/json" -d "$dados")
  else
    codigo=$(curl -s -o "$TMP" -w "%{http_code}" -X "$metodo" "$BASE_URL$rota")
  fi

  if [ "$codigo" = "$esperado" ]; then
    echo " [PASSOU] HTTP $codigo (esperado $esperado)"
    OK=$((OK+1))
  else
    echo " [FALHOU] HTTP $codigo (esperado $esperado)"
    FALHAS=$((FALHAS+1))
  fi
  jq . "$TMP" 2>/dev/null || cat "$TMP"
}

# conferir "descrição" VALOR_OBTIDO VALOR_ESPERADO
conferir() {
  local descricao="$1" atual="$2" esperado="$3"
  if [ "$atual" = "$esperado" ]; then
    echo " [PASSOU] $descricao: $atual"
    OK=$((OK+1))
  else
    echo " [FALHOU] $descricao: obtido '$atual', esperado '$esperado'"
    FALHAS=$((FALHAS+1))
  fi
}

executar_testes() {
  echo "=================================================="
  echo " AUDITORIA DA API - CHAMADOS DE SUPORTE T.I."
  echo " Data/Hora: $(date)"
  echo " Base: $BASE_URL"
  echo "=================================================="

  if ! curl -s -o /dev/null "$BASE_URL/health"; then
    echo "[ERRO] Servidor fora do ar em $BASE_URL. Rode 'npm start' antes."
    return 1
  fi

  # ============================ TÉCNICOS ============================
  echo ""
  echo "######## TÉCNICOS ########"

  chamar "Listar todos os técnicos" GET /tecnicos 200
  chamar "Filtrar técnicos por especialidade" GET "/tecnicos?especialidade=REDES" 200
  chamar "Filtrar técnicos por status" GET "/tecnicos?status=ATIVO" 200
  
  chamar "Criar técnico" POST /tecnicos 201 \
  '{"nome":"Teste Automacao","email":"teste@empresa.com","especialidade":"redes"}'
  
  TEC_ID=$(jq -r '.id' "$TMP")

  conferir "especialidade normalizada para maiúsculo" "$(jq -r '.especialidade' "$TMP")" "REDES"
  conferir "status padrão do técnico" "$(jq -r '.status' "$TMP")" "ATIVO"
  
  chamar "Criar técnico sem 'nome' (400)" POST /tecnicos 400 \
  '{"email":"x@x.com","especialidade":"REDES"}'
  
  chamar "Buscar técnico por ID" GET "/tecnicos/$TEC_ID" 200
  chamar "Buscar técnico inexistente (404)" GET /tecnicos/99999 404
  
  chamar "Substituir técnico (PUT)" PUT "/tecnicos/$TEC_ID" 200 \
  '{"nome":"Teste Atualizado","email":"novo@empresa.com","especialidade":"SOFTWARE","status":"ATIVO"}'
  
  chamar "PUT incompleto (400)" PUT "/tecnicos/$TEC_ID" 400 '{"nome":"So o nome"}'
  
  chamar "PUT em técnico inexistente (404)" PUT /tecnicos/99999 404 \
  '{"nome":"X","email":"x@x.com","especialidade":"REDES"}'
  
  chamar "Atualizar parcialmente (PATCH)" PATCH "/tecnicos/$TEC_ID" 200 \
  '{"status":"INATIVO"}'
  
  conferir "status após o PATCH" "$(jq -r '.status' "$TMP")" "INATIVO"
  
  chamar "PATCH sem campos (400)" PATCH "/tecnicos/$TEC_ID" 400 '{}'
  
  chamar "PATCH com status inválido (400)" PATCH "/tecnicos/$TEC_ID" 400 \
  '{"status":"VOANDO"}'
  
  chamar "PATCH em técnico inexistente (404)" PATCH /tecnicos/99999 404 \
  '{"status":"ATIVO"}'
  
  chamar "Remover técnico" DELETE "/tecnicos/$TEC_ID" 200
  chamar "Remover de novo (404)" DELETE "/tecnicos/$TEC_ID" 404

	# ------- CÓDIGO ANTIGO (já existe) -------
  chamar "Remover de novo (404)" DELETE "/tecnicos/$TEC_ID" 404

  # ------- CÓDIGO NOVO (adicionar aqui) -------
  # ============================ CHAMADOS ============================
  echo ""
  echo "######## CHAMADOS ########"

  # Técnico auxiliar, só para vincular chamados durante o teste
  chamar "Criar técnico auxiliar" POST /tecnicos 201 \
  '{"nome":"Tecnico Auxiliar","email":"aux@empresa.com","especialidade":"HARDWARE"}'
  TEC2_ID=$(jq -r '.id' "$TMP")

  chamar "Listar todos os chamados" GET /chamados 200
  chamar "Filtrar chamados por status" GET "/chamados?status=ABERTO" 200
  chamar "Filtrar chamados por prioridade" GET "/chamados?prioridade=ALTA" 200
  chamar "Filtrar chamados por técnico" GET "/chamados?tecnicoId=1" 200

  chamar "Criar chamado vinculado ao técnico auxiliar" POST /chamados 201 \
  '{"titulo":"Monitor sem imagem","descricao":"Tela preta ao ligar.","prioridade":"media","solicitante":"RH","tecnicoId":'"$TEC2_ID"'}'
  CHAM_ID=$(jq -r '.id' "$TMP")

  conferir "prioridade normalizada para maiúsculo" "$(jq -r '.prioridade' "$TMP")" "MEDIA"
  conferir "status padrão do chamado" "$(jq -r '.status' "$TMP")" "ABERTO"

  chamar "Criar chamado sem 'titulo' (400)" POST /chamados 400 \
  '{"descricao":"x","prioridade":"ALTA","solicitante":"RH"}'
  chamar "Criar chamado com prioridade inválida (400)" POST /chamados 400 \
  '{"titulo":"x","descricao":"x","prioridade":"URGENTISSIMA","solicitante":"RH"}'
  chamar "Criar chamado com tecnicoId inexistente (404)" POST /chamados 404 \
  '{"titulo":"x","descricao":"x","prioridade":"ALTA","solicitante":"RH","tecnicoId":99999}'

  chamar "Buscar chamado por ID" GET "/chamados/$CHAM_ID" 200
  chamar "Buscar chamado inexistente (404)" GET /chamados/99999 404

  chamar "Substituir chamado (PUT)" PUT "/chamados/$CHAM_ID" 200 \
  '{"titulo":"Monitor trocado","descricao":"Monitor novo instalado.","prioridade":"BAIXA","solicitante":"RH","status":"EM_ANDAMENTO","tecnicoId":'"$TEC2_ID"'}'
  chamar "PUT incompleto (400)" PUT "/chamados/$CHAM_ID" 400 '{"titulo":"So o titulo"}'
  chamar "PUT em chamado inexistente (404)" PUT /chamados/99999 404 \
  '{"titulo":"x","descricao":"x","prioridade":"ALTA","solicitante":"RH"}'

  chamar "Atualizar parcialmente (PATCH)" PATCH "/chamados/$CHAM_ID" 200 \
  '{"status":"RESOLVIDO"}'
  conferir "status após o PATCH" "$(jq -r '.status' "$TMP")" "RESOLVIDO"

  chamar "PATCH sem campos (400)" PATCH "/chamados/$CHAM_ID" 400 '{}'
  chamar "PATCH com tecnicoId inexistente (404)" PATCH "/chamados/$CHAM_ID" 404 \
  '{"tecnicoId":99999}'
  chamar "PATCH em chamado inexistente (404)" PATCH /chamados/99999 404 \
  '{"status":"FECHADO"}'

  # Regra de negócio: remover técnico deixa os chamados dele sem responsável
  chamar "Remover técnico auxiliar (desvincula os chamados dele)" DELETE "/tecnicos/$TEC2_ID" 200
  conferir "chamados desvinculados" "$(jq -r '.chamadosDesvinculados' "$TMP")" "1"

  chamar "Conferir que o chamado ficou sem técnico" GET "/chamados/$CHAM_ID" 200
  conferir "tecnicoId do chamado agora é null" "$(jq -r '.tecnicoId' "$TMP")" "null"

  chamar "Remover chamado" DELETE "/chamados/$CHAM_ID" 200
  chamar "Remover chamado de novo (404)" DELETE "/chamados/$CHAM_ID" 404

  # ============================ ERROS GERAIS ============================
  echo ""
  echo "######## ERROS GERAIS ########"
  chamar "JSON malformado (400)" POST /chamados 400 '{ "titulo": '
  chamar "Rota inexistente (404)" GET /rota-que-nao-existe 404

  # ------- CÓDIGO ANTIGO (continua abaixo) -------

  # ============================ RESUMO ============================
  echo ""
  echo "=================================================="
  echo " RESULTADO: $OK passaram | $FALHAS falharam"
  echo "=================================================="
  [ "$FALHAS" -eq 0 ]
}

executar_testes 2>&1 | tee "$LOG"
RESULTADO=${PIPESTATUS[0]}
rm -f "$TMP"
exit "$RESULTADO"
