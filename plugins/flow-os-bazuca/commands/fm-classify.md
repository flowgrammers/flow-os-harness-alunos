---
description: Classifica texto bruto em itens operacionais categorizados por tipo e urgência
---
# /fm-classify

## O que essa skill faz

Classifica texto bruto (transcricao de reuniao, mensagem WhatsApp, notas) em itens operacionais categorizados com tipo, subtipo, projeto, urgencia e responsavel sugerido. Usa o agente `input-classifier` para processamento.

---

## Quando usar

- Recebeu transcricao de reuniao e precisa extrair action items
- Recebeu mensagens de WhatsApp com demandas misturadas
- Quer processar notas de brainstorming em itens acionaveis
- Precisa alimentar o pipeline de triagem (`/fm-triage`)

---

## Input esperado

**Minimo:**
- Texto bruto para classificar (colado diretamente ou path de arquivo)

**Opcional:**
- Nome do projeto (para filtrar classificacao)
- Contexto adicional (quem sao os participantes, tipo de reuniao)

**Fallback:** Se nenhum texto for fornecido, perguntar ao usuario.

---

## Processo

1. **Receber input** — texto bruto ou path de arquivo
2. **Se arquivo**: ler conteudo com Read tool
3. **Identificar fonte**: tipo (reuniao/whatsapp/notas), data, participantes
4. **Ler `.out-of-scope/` do projeto antes de avaliar** (se a pasta existir na raiz): `_pressupostos.md`
   e um arquivo por conceito recusado, cada um com uma linha `Palavras-chave:`. Item que casa com um
   conceito é **reincidente**: a classificação cita o arquivo (`Reincidência: .out-of-scope/<arquivo>.md`),
   mantém a Disposição que o arquivo indica e **nunca reabre sozinha** — reabrir é decisão de quem responde pelo produto,
   registrada no próprio arquivo. Item que casa com um pressuposto caído sai como `FORA_DE_ESCOPO` com a
   nota `caducado: <pressuposto>`.
5. **Invocar agente input-classifier** para classificacao
6. **Apresentar resultado** em formato tabular
7. **Sugerir proximo passo**: `/fm-triage` para triagem humana

---

## Taxonomia

| Tipo | Descricao |
|------|-----------|
| OPORTUNIDADE | Novo negocio, parceria, expansao |
| PROBLEMA | Bug, falha operacional, dor |
| PROJETO_NOVO | Ideia de projeto completo |
| ROADMAP_ITEM | Feature/entregavel para projeto existente |
| ATIVIDADE | Tarefa operacional pontual |
| DECISAO | Decisao registrada |
| INFO | Informacao sem acao imediata |

Subtipos: Comercial | Gestao | Produto | Operacional | Conteudo | Pessoas | Financeiro | Juridico

### Disposição (eixo obrigatório — o que fazemos com o item em relação ao cliente)

Critérios NA ORDEM (primeiro que casar decide). Detalhes: skill `input-classification`.

| Sinal | Disposição |
|-------|------------|
| Bug confirmado, correção sem decisão de produto em aberto; obrigação legal/a11y/segurança | COMUNICADO |
| Depende de resposta/insumo de terceiro | BLOQUEIO |
| Comercial/administrativo/operado por terceiro | FORA_DE_ESCOPO |
| Ideia sem decisão na fonte OU sugestão nossa (INFERIDO) | PROPOSTA |
| Ajuste visual/copy XS/S sem regra de negócio | LOTE |
| Requisito novo / mudança de comportamento, fonte identificável | VALIDAR |
| Ambíguo | VALIDAR (nunca rebaixar em silêncio) |

**Verbatim**: DITO (pedido literal — citar trecho exato) ou INFERIDO (deduzido — explicar a base,
nunca inventar citação). INFERIDO nunca recebe VALIDAR.

---

## Output

### Por item:

```markdown
### CLS-{YYYY-MM-DD}-{NNN}

| Campo | Valor |
|-------|-------|
| **Texto Original** | "{trecho}" |
| **Tipo** | {tipo} |
| **Subtipo** | {subtipo} |
| **Disposição** | {COMUNICADO/LOTE/VALIDAR/PROPOSTA/BLOQUEIO/FORA_DE_ESCOPO} |
| **Verbatim** | {DITO/INFERIDO} |
| **Reincidência** | {.out-of-scope/<arquivo>.md ou —} |
| **Projeto** | {projeto} |
| **Urgencia** | {urgencia} |
| **Responsavel Sugerido** | {nome} |
| **Fonte** | {ref} |
| **Confianca** | {nivel} |
| **Acao Sugerida** | {comando/acao} |
```

### Resumo final:

```markdown
## Resumo

| Tipo | Qtd |
|------|-----|
| OPORTUNIDADE | N |
| PROBLEMA | N |
| ... | ... |
| **Total** | **N** |

### Urgencia CRITICA/ALTA
1. CLS-XXX — {titulo}

### Proximo passo
→ Execute `/fm-triage` para triagem humana dos N itens
```

---

## Regras

1. **Nunca auto-aprovar** — classificacao sempre requer triagem humana
2. **1 item = 1 acao** — granularidade maxima
3. **Preservar texto original** como referencia rastreavel
4. **Marcar confianca BAIXA** quando ambiguo
5. **Mapear projetos** para lista de projetos ativos do CLAUDE.md
6. **Reincidência cita o arquivo, nunca reabre sozinha** — pedido que casa com `.out-of-scope/` não é
   relitigado do zero: a conversa começa pelo "o que faria reabrir" que o arquivo já registra

---

## Exemplo

**Input:**
```
Reuniao com Paolo e Livia (05/06/2026):
- Paolo pediu pra corrigir os erros de ortografia na plataforma toda, isso e urgente
- Livia sugeriu criar um dashboard admin pra visualizar metricas
- Ficou decidido que o login vai ser por email individual, nao mais CNPJ
- Paolo mencionou uma possivel parceria com a empresa X para expansao
```

**Output:**
4 itens classificados:
1. CLS-2026-06-05-001: Corrigir ortografia (PROBLEMA/Produto/CRITICA)
2. CLS-2026-06-05-002: Dashboard admin (ROADMAP_ITEM/Produto/MEDIA)
3. CLS-2026-06-05-003: Login por email individual (DECISAO/Produto/ALTA)
4. CLS-2026-06-05-004: Parceria empresa X (OPORTUNIDADE/Comercial/MEDIA)
