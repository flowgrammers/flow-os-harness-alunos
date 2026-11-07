---
name: requirement-verification
version: 1.0.0
description: >
  Framework de verificacao multi-dimensional de requisitos com loop agentico.
  5 dimensoes (completude, viabilidade, dependencias, seguranca, alinhamento),
  scoring 0-50 e integracao com pipeline FM.
  Use SEMPRE que novos requisitos chegarem de qualquer fonte.
triggers:
  - verificar requisito
  - validar requisito
  - requirement verification
  - aprovar requisito
  - score de requisito
  - prontidao de requisito
  - verificacao multi-dimensional
---

# Requirement Verification Framework

## Visao Geral

Este framework garante que nenhum requisito entre em execucao sem passar por
verificacao rigorosa em 5 dimensoes. O loop agentico automatiza a analise e
produz um score de prontidao que determina se o requisito pode prosseguir.

## Roteamento por Disposição (ANTES de verificar)

A verificação 5D completa é cara (opus). A Disposição do item (ver
a regra `agentic-loop` (seção Disposição)) decide o
nível de verificação:

| Disposição | Verificação | Executor |
|------------|-------------|----------|
| VALIDAR / PROPOSTA promovida | 5D completa (0-50, thresholds abaixo) | `requirement-verification-loop` (opus) |
| COMUNICADO | Leve: causa confirmada? sem decisão de produto embutida? sem conflito? | Sessão corrente, sem subagente |
| LOTE | Leve: nenhum item do pacote toca regra de negócio? esforço somado ≤ M? | Sessão corrente, sem subagente |
| BLOQUEIO / FORA_DE_ESCOPO | Nenhuma (não são requisitos) | — |

A verificação leve é registrada no campo Triagem do card (1-3 linhas), não gera relatório VER-*.
Se a verificação leve encontrar decisão de produto embutida num COMUNICADO ou regra de negócio
num item de LOTE, o item é REclassificado para VALIDAR e segue a 5D completa.

## As 5 Dimensoes

### 1. COMPLETUDE (0-10 pontos)

| Criterio | Peso | Como Verificar |
|----------|------|----------------|
| Objetivo claro e mensuravel | 2 | Tem verbo de acao + resultado esperado? |
| Criterios de aceitacao | 2 | Tem Given/When/Then ou equivalente? |
| Escopo delimitado | 1 | Define o que NAO faz parte? |
| Persona identificada | 1 | Quem usa/beneficia? |
| Metricas de sucesso | 2 | Como saber se deu certo? |
| Dependencias listadas | 1 | O que precisa estar pronto antes? |
| Prioridade | 1 | P1/P2/P3 ou RICE score? |

Se faltam criterios de aceitacao, GERAR automaticamente no formato:
```
DADO {contexto}
QUANDO {acao}
ENTAO {resultado esperado}
```

### 2. VIABILIDADE TECNICA (0-10 pontos)

| Criterio | Peso | Como Verificar |
|----------|------|----------------|
| Stack compativel | 2 | Ler CLAUDE.md do projeto alvo |
| Infra existente | 2 | VPS, Supabase, n8n disponivel? |
| APIs disponiveis | 2 | Servicos externos acessiveis? |
| Conhecimento no time | 1 | Tecnologia conhecida? |
| Estimativa de esforco | 2 | P (<1 dia), M (1-3 dias), G (3-10 dias), XG (>10 dias) |
| Restricoes conhecidas | 1 | Limites de API, performance, etc? |

### 3. DEPENDENCIAS E CONFLITOS (0-10 pontos)

| Criterio | Peso | Como Verificar |
|----------|------|----------------|
| Sem bloqueios upstream | 3 | Ler REGISTRO.md — depende de algo EM_EXECUCAO? |
| Nao bloqueia prioridades | 2 | Impede progresso de algo mais importante? |
| Sem conflitos de escopo | 2 | Contradiz requisito existente? |
| Recursos disponiveis | 2 | VPS/Supabase/API compartilhada tem capacidade? |
| Deadline factivel | 1 | Se tem deadline, e alcancavel? |

### 4. SEGURANCA E COMPLIANCE (0-10 pontos)

| Criterio | Peso | Como Verificar |
|----------|------|----------------|
| Auth/authz seguro | 2 | Toca em login, permissoes, tokens? |
| Dados pessoais (LGPD) | 2 | Coleta, armazena ou processa dados pessoais? |
| Endpoints publicos | 2 | Expoe API sem protecao? |
| Secrets necessarios | 2 | Precisa de novas credenciais? |
| Infra de producao | 1 | Altera config de producao? |
| Security review | 1 | Precisa de review antes de implementar? |

Pontuacao INVERTIDA: se toca em seguranca e NAO tem plan de mitigacao, PERDE pontos.
Se nao toca em seguranca, ganha pontos cheios.

### 5. ALINHAMENTO ESTRATEGICO (0-10 pontos)

| Criterio | Peso | Como Verificar |
|----------|------|----------------|
| Alinhado com metas | 2 | Conecta a OKR, meta trimestral ou board Trello? |
| Resolve problema mapeado | 2 | Conecta a P01-P12 do board? |
| Captura oportunidade | 2 | Conecta a O01-O13 do board? |
| ROI justifica esforco | 2 | Beneficio > custo estimado? |
| Sponsor identificado | 1 | Quem pediu e por que? |
| Urgencia real | 1 | Deadline externo vs urgencia percebida? |

## Threshold de Decisao

| Score Total | Decisao | Acao |
|------------|---------|------|
| 40-50 | **APROVADO** | Registrar no REGISTRO.md, prosseguir para planejamento |
| 30-39 | **CONDICIONAL** | Listar gaps, resolver antes de prosseguir |
| 20-29 | **REJEITADO** | Reformular requisito, re-submeter |
| 0-19 | **REJEITADO CRITICO** | Requisito incompleto ou inviavel, descartar ou repensar |

## Integracao com Pipeline

```
Input bruto
    |
    v
/fm-classify          <- Classificar tipo e urgencia
    |
    v
/verify-requirement   <- Este framework (5 dimensoes)
    |
    v
  Score >= 40?
    |         |
   SIM       NAO
    |         |
    v         v
/fm-requirement-register    Feedback ao usuario
    |                       (gaps a resolver)
    v
  Complexo?
    |         |
   SIM       NAO
    |         |
    v         v
/pm-prd      /plan
    |         |
    v         v
/pm-task-decompose    Implementar
    |
    v
/wave-execute (se multi-task)
```

## Formato de Relatorio

Relatorios de verificacao sao salvos em:
`{projeto}/docs/requisitos/verificacoes/VER-{YYYY-MM-DD}-{slug}.md`

Cada relatorio contem:
- Scores por dimensao com justificativa
- Gaps encontrados
- Criterios de aceitacao sugeridos (se gerados)
- Dependencias cruzadas identificadas
- Flags de seguranca
- Recomendacao final
- Proximo passo concreto
