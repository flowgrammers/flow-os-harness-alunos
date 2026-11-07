---
name: input-classification
description: Motor de classificacao de inputs (audio, texto, transcricao) em categorias operacionais com taxonomia padronizada e regras de roteamento.
origin: custom
version: 1.0.0
triggers:
  - classificar input
  - input classification
  - categorizar texto
  - roteamento
---

# Input Classification

Motor de classificacao que transforma qualquer input bruto (audio transcrito, texto WhatsApp, transcricao de reuniao, evento de calendario) em itens categorizados com tipo, subtipo, projeto, urgencia e responsavel sugerido.

## Quando Ativar

- Processar transcricao de reuniao
- Classificar mensagens de WhatsApp
- Triar inputs de multiplas fontes antes de execucao
- Alimentar pipeline de triagem (`/fm-triage`)

## Taxonomia de Tipos

| Tipo | Descricao | Acao Automatica |
|------|-----------|-----------------|
| OPORTUNIDADE | Novo negocio, parceria, expansao | Sugere `/pm-prd` ou `/pm-lean-canvas` |
| PROBLEMA | Bug, falha operacional, dor do usuario | Trello card + REGISTRO.md |
| PROJETO_NOVO | Ideia de projeto completo | Sugere `/fm-project-init` |
| ROADMAP_ITEM | Feature/entregavel para projeto existente | Sugere `/pm-roadmap` update |
| ATIVIDADE | Tarefa operacional pontual | Trello card no board do projeto |
| DECISAO | Decisao registrada em reuniao | REGISTRO.md |
| INFO | Informacao sem acao imediata | arquivo local em docs/ do projeto |

## Subcategorias

| Subcategoria | Exemplos |
|-------------|----------|
| Comercial | Proposta, lead, parceria, precificacao |
| Gestao | Processo, metodologia, ferramenta |
| Produto | Feature, UX, bug, performance |
| Operacional | Infra, deploy, CI/CD, monitoramento |
| Conteudo | Aula, post, video, documentacao |
| Pessoas | Contratacao, capacitacao, feedback |
| Financeiro | Orcamento, pagamento, investimento |
| Juridico | Contrato, compliance, regulamentacao |

## Campos do Output Classificado

Cada item classificado DEVE conter:

```markdown
| Campo | Valor |
|-------|-------|
| **ID** | CLS-YYYY-MM-DD-NNN |
| **Texto Original** | Trecho exato da fonte |
| **Tipo** | OPORTUNIDADE / PROBLEMA / PROJETO_NOVO / ROADMAP_ITEM / ATIVIDADE / DECISAO / INFO |
| **Subtipo** | Comercial / Gestao / Produto / Operacional / Conteudo / Pessoas / Financeiro / Juridico |
| **Disposição** | COMUNICADO / LOTE / VALIDAR / PROPOSTA / BLOQUEIO / FORA_DE_ESCOPO |
| **Verbatim** | DITO (falante pediu literalmente) / INFERIDO (deduzido pela equipe) |
| **Projeto** | Nome do projeto (ou "Cross-projeto" / "Novo") |
| **Urgencia** | CRITICA / ALTA / MEDIA / BAIXA |
| **Responsavel Sugerido** | Nome ou papel |
| **Fonte** | Reuniao X (timestamp) / WhatsApp (data) / Calendar (evento) |
| **Confianca** | ALTA / MEDIA / BAIXA (confianca da classificacao) |
```

## Disposição (eixo obrigatório desde 2026-07-21)

O que fazemos com o item em relação ao cliente. Aplicar os critérios NA ORDEM — o primeiro que
casar decide. Fonte da verdade: a regra `agentic-loop` (seção Disposição).

| Sinal observável | Disposição |
|------------------|------------|
| Bug confirmado E correção sem decisão de produto em aberto | COMUNICADO |
| Obrigação legal/a11y/segurança sem alternativa de escopo | COMUNICADO |
| Reafirmação de entendimento do plano já acordado | COMUNICADO |
| Depende de resposta/insumo de terceiro | BLOQUEIO |
| Comercial/administrativo/operado por terceiro | FORA_DE_ESCOPO |
| Ideia sem decisão na fonte ("seria bom") OU sugestão nossa (INFERIDO) | PROPOSTA |
| Ajuste visual/copy XS/S sem mudança de regra de negócio | LOTE |
| Requisito novo / mudança de comportamento, fonte identificável | VALIDAR |
| Ambíguo / confiança BAIXA | VALIDAR (nunca rebaixar em silêncio) |

Desempates:
- Bug cuja correção admite mais de um comportamento válido → VALIDAR (há decisão embutida).
- Trivial que toca regra de negócio → sai do LOTE, vira VALIDAR.
- INFERIDO nunca recebe VALIDAR — nasce PROPOSTA; só o cliente promove.

## Regras de Classificacao

1. **Palavras-chave de urgencia CRITICA**: "urgente", "bloqueado", "parado", "deadline amanha", "cliente reclamou"
2. **Palavras-chave de OPORTUNIDADE**: "parceria", "novo cliente", "proposta", "investimento", "expansao"
3. **Palavras-chave de PROBLEMA**: "bug", "erro", "nao funciona", "reclamacao", "quebrou"
4. **Palavras-chave de DECISAO**: "decidimos", "ficou definido", "a partir de agora", "aprovado", "rejeitado"
5. **Multiplos tipos**: Um paragrafo pode gerar multiplos itens (ex: decisao + atividade)
6. **Confianca BAIXA**: Sempre que o texto for ambiguo, marcar confianca BAIXA para revisao humana
7. **Nunca auto-aprovar**: Classificacao SEMPRE requer triagem humana via `/fm-triage`

## Prompt de Classificacao (para LLM)

```
Voce e um classificador de inputs operacionais da Flowgrammers.

Dado o texto abaixo, extraia TODOS os itens acionaveis e classifique cada um com:
- Tipo (OPORTUNIDADE, PROBLEMA, PROJETO_NOVO, ROADMAP_ITEM, ATIVIDADE, DECISAO, INFO)
- Subtipo (Comercial, Gestao, Produto, Operacional, Conteudo, Pessoas, Financeiro, Juridico)
- Disposicao (COMUNICADO, LOTE, VALIDAR, PROPOSTA, BLOQUEIO, FORA_DE_ESCOPO) — criterios na ordem da tabela; ambiguo = VALIDAR
- Verbatim (DITO se o falante pediu literalmente — cite o trecho exato; INFERIDO se voce deduziu — explique a base, NUNCA invente citacao)
- Projeto associado (use a lista de projetos ativos do CLAUDE.md ou "Cross-projeto"/"Novo")
- Urgencia (CRITICA, ALTA, MEDIA, BAIXA)
- Responsavel sugerido (baseado no contexto)
- Confianca da classificacao (ALTA, MEDIA, BAIXA)

Regras:
- Um paragrafo pode gerar MULTIPLOS itens
- Prefira granularidade: 1 item = 1 acao
- Se ambiguo, marque confianca BAIXA
- Preserve o texto original como referencia
- Inclua timestamp/paragrafo da fonte quando disponivel
- Bug confirmado = COMUNICADO (nao pede aprovacao); bug com decisao de produto embutida = VALIDAR
- Item INFERIDO nunca recebe disposicao VALIDAR — sempre PROPOSTA
```

## Integracao com Pipeline

```
INPUT → /fm-classify → Lista classificada → /fm-triage → Aprovacao humana → Execucao
                                                                              ↓
                                                              /fm-requirement-register (REGISTRO.md)
                                                              Trello card (se ATIVIDADE/PROBLEMA)
                                                              /fm-project-init (se PROJETO_NOVO)
                                                              /pm-prd (se OPORTUNIDADE)
```
