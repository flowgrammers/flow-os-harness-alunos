---
description: Submete um requisito ao loop agentico de verificacao multi-dimensional (5 dimensoes, score 0-50). Gera relatorio de prontidao e registra no REGISTRO.md se aprovado.
argument_description: Texto do requisito ou path para arquivo com requisito. Se vazio, pede input interativo.
---

# Verify Requirement

## Roteamento por Disposição (ANTES de lançar o agente)

Se o item já tem **Disposição** (da classificação/triagem), rotear:

| Disposição | Verificação |
|------------|-------------|
| `VALIDAR` / `PROPOSTA` promovida | 5D completa — lançar o agente (fluxo abaixo) |
| `COMUNICADO` | Leve, NESTA sessão (sem agente): causa confirmada? sem decisão de produto embutida? sem conflito? Registrar 1-3 linhas no campo Triagem do card. Se houver decisão embutida → reclassificar como VALIDAR e seguir a 5D |
| `LOTE` | Leve, NESTA sessão: nenhum item do pacote toca regra de negócio? esforço somado ≤ M? Se tocar → item sai do lote, vira VALIDAR |
| `BLOQUEIO` / `FORA_DE_ESCOPO` | Não verificar (não são requisitos) |

Sem disposição atribuída → classificar primeiro (tabela na skill `input-classification`);
ambíguo = VALIDAR.

## Verificação 5D completa

Execute o agente `requirement-verification-loop` com o seguinte input:

**Requisito a verificar**: $ARGUMENTS

Se $ARGUMENTS estiver vazio, pergunte ao usuario:
1. Qual e o requisito? (texto livre)
2. Qual projeto alvo? (nome da pasta)
3. Qual a origem? (reuniao, WhatsApp, ideia, Trello, etc.)

Apos coletar, lance o agente requirement-verification-loop passando todo o contexto (incluindo
Disposição e Verbatim/Citação, se existirem).

Ao receber o relatorio de volta:
1. Exibir o sumario de scores ao usuario
2. Se APROVADO (>=40/50): Perguntar se quer registrar via `/fm-requirement-register`
3. Se CONDICIONAL (30-39/50): aplicar o protocolo de clarificação por modo (abaixo) e re-verificar
4. Se REJEITADO (<30/50): Explicar por que e sugerir reformulacao

Salvar relatorio em `docs/requisitos/verificacoes/` do projeto alvo.

## Clarificação por modo (ask → assume)

Detectar o modo pela natureza do INPUT (regra agentic-loop) + contagem de fontes: requisito vindo de documento formal com 2+ fontes indexadas em `docs/escopo/FONTES-DE-ESCOPO.md` = enterprise; projeto com stack de cliente/legado = legado; input verbal ou fonte única = bazuca.

- **Bazuca**: NÃO abrir interrogatório. Para cada gap do relatório, propor uma Assumption (default razoável + por quê) e re-submeter ao agente com as assumptions anexadas. Máximo 2 perguntas diretas, somente se o gap for material E irreversível (perda de dados, custo externo, arquitetura cara de reverter). As assumptions entram no relatório salvo (seção "Assumptions") e acompanham o requisito no REGISTRO.md. Em projeto de NÍVEL legado com requisito verbal, incluir assumptions conservadoras de preservação de comportamento (ex.: "preservar todo comportamento observável atual").
- **Enterprise**: até 5 perguntas dirigidas, priorizando D1 (completude) e conflitos de precedência entre fontes (hierarquia: contrato > edital > ata > proposta > reunião). Cada resposta é gravada no relatório de verificação (seção "Clarificações registradas": pergunta + resposta + quem + data) ANTES da re-verificação. Pergunta sem resposta vira marcador `[NEEDS CLARIFICATION]` — requisito NÃO entra em APROVADOS.md com marcador material aberto.
- **Legado**: igual enterprise, acrescentando às perguntas as categorias: comportamento existente a preservar, contratos implícitos de API, dados de produção afetados, testes de caracterização necessários.

## Pos-Verificacao Automatica

Apos gerar o relatorio de verificacao:

1. Se score >= 40 (APROVADO):
   - Perguntar: "Score [X]/50 — APROVADO. Registrar no REGISTRO.md como APROVADO agora? (sim/nao)"
   - Se sim: executar /fm-requirement-register com status APROVADO
   - Se FLAG_SEGURANCA marcado: avisar "ATENCAO: Este requisito tem flag de seguranca. Recomendo rodar security-reviewer antes de implementar."

2. Se score 30-39 (CONDICIONAL):
   - Listar gaps especificos
   - Aplicar a seção "Clarificação por modo" (acima): em bazuca, propor assumptions e re-verificar sem interrogatório; em enterprise/legado, perguntas dirigidas com registro no relatório

3. Se score < 30 (REJEITADO):
   - Sugerir reformulacao com dicas especificas
