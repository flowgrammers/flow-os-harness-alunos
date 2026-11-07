# Loop Agentico de Requisitos e Documentacao

## Principio

Todo input que chega ao sistema (texto, audio, reuniao, documento, ideia) DEVE passar pelo pipeline
agentico antes de virar trabalho. Nenhum requisito entra em execucao sem score de verificacao.

Um mesmo projeto pode alternar entre modo bazuca e enterprise ao longo do tempo.
O gatilho e a NATUREZA DO INPUT, nao uma configuracao fixa do projeto.

---

## Deteccao Automatica de Modo

O harness detecta o modo pelo tipo de input:

| Input | Modo Ativado | Gatilho |
|-------|-------------|---------|
| Audio/texto do stakeholder | BAZUCA | Sem documento formal, 1 fonte |
| 1 documento de escopo (contrato OU edital) | BAZUCA | 1 fonte formal, sem conflito possivel |
| 2+ documentos de escopo | ENTERPRISE | Multiplas fontes, conflitos possiveis |
| Reuniao com multiplos stakeholders | ENTERPRISE | Multiplas perspectivas, ata obrigatoria |
| Bug report / pedido simples | BAZUCA | Input atomico, sem escopo |
| Audio + contrato + edital no mesmo projeto | MISTO | Partes do projeto em modos diferentes |

**Regra**: Na duvida, usar ENTERPRISE. E mais seguro verificar demais do que de menos.

---

## Pipeline Completo — Diagrama Unificado

```
╔══════════════════════════════════════════════════════════════════╗
║                    INPUT BRUTO (qualquer fonte)                  ║
╚══════════════════════════════════╦═══════════════════════════════╝
                                   ║
                    ┌──────────────╨──────────────┐
                    │     Que tipo de input?       │
                    └──────┬──────────────┬────────┘
                           │              │
              ┌────────────▼──┐    ┌──────▼────────────┐
              │  AUDIO/TEXTO  │    │ DOCUMENTO FORMAL   │
              │  (reuniao,    │    │ (edital, contrato, │
              │   WhatsApp,   │    │  proposta, briefing)│
              │   ideia)      │    │                    │
              └──────┬────────┘    └──────┬─────────────┘
                     │                    │
                     ▼                    ▼
            ┌────────────────┐   ┌────────────────────┐
            │ Se audio:      │   │ Salvar em           │
            │ audio-          │   │ docs/escopo/        │
            │ transcription  │   │ (editais/ ou        │
            │                │   │  contratos/)        │
            │ Se reuniao:    │   │                     │
            │ /fm-meeting-   │   │ Atualizar           │
            │  process       │   │ FONTES-DE-ESCOPO.md │
            └──────┬─────────┘   └──────┬──────────────┘
                   │                    │
                   ▼                    ▼
            ┌─────────────┐     ┌──────────────────┐
            │ /fm-classify │     │ Extrair requisitos│
            │ (tipo +      │     │ POR FONTE         │
            │  urgencia)   │     │ (secao, clausula) │
            └──────┬───────┘     └──────┬────────────┘
                   │                    │
                   │              ┌─────▼──────────┐
                   │              │ 2+ fontes?      │
                   │              └──┬──────────┬───┘
                   │                 │ SIM      │ NAO
                   │                 ▼          │
                   │          ┌────────────┐    │
                   │          │ DETECTAR    │    │
                   │          │ CONFLITOS   │    │
                   │          │ entre fontes│    │
                   │          └──────┬──────┘    │
                   │                 │           │
                   │          ┌──────▼──────┐    │
                   │          │ Conflitos?   │    │
                   │          └──┬───────┬───┘    │
                   │             │ SIM   │ NAO    │
                   │             ▼       │        │
                   │      ┌──────────┐   │        │
                   │      │ RESOLVER  │   │        │
                   │      │ com stake-│   │        │
                   │      │ holder    │   │        │
                   │      │ + gerar   │   │        │
                   │      │ ata       │   │        │
                   │      └────┬─────┘   │        │
                   │           │         │        │
                   ▼           ▼         ▼        ▼
            ┌──────────────────────────────────────────┐
            │        REGISTRO.md (LISTADO)              │
            │  Todo requisito com data, origem, fonte   │
            └────────────────────┬──────────────────────┘
                                 │
                                 ▼
            ┌──────────────────────────────────────────┐
            │     VERIFICACAO 5D (score 0-50)           │
            │                                          │
            │  D1: Completude         (0-10)           │
            │  D2: Viabilidade        (0-10)           │
            │  D3: Dependencias       (0-10)           │
            │  D4: Seguranca          (0-10)           │
            │  D5: Alinhamento*       (0-10)           │
            │                                          │
            │  *Bazuca: alinhamento estrategico        │
            │  *Enterprise: alinhamento CONTRATUAL     │
            │   (esta no edital? no contrato?          │
            │    dentro das horas? tem deadline?)      │
            └───────────────────┬───────────────────────┘
                                │
                   ┌────────────┼────────────┐
                   │            │            │
                   ▼            ▼            ▼
            ┌──────────┐ ┌──────────┐ ┌──────────┐
            │ >= 40     │ │ 30-39    │ │ < 30     │
            │ APROVADO  │ │ CONDIC.  │ │ REJEITADO│
            └─────┬─────┘ └─────┬────┘ └─────┬────┘
                  │             │             │
                  │             ▼             ▼
                  │      Resolver gaps   Reformular
                  │      Re-verificar    ou descartar
                  │             │
                  ▼             │
           ┌──────────────┐    │
           │ Enterprise?   │    │
           └──┬────────┬───┘    │
              │ SIM    │ NAO    │
              ▼        │        │
       ┌───────────┐   │        │
       │ GERAR ATA │   │        │
       │ aprovacao  │   │        │
       │ em docs/   │   │        │
       │ escopo/    │   │        │
       │ atas-      │   │        │
       │ aprovacao/ │   │        │
       └─────┬─────┘   │        │
             │         │        │
             ▼         ▼        │
       ┌──────────────────┐     │
       │  APROVADOS.md     │     │
       │  (pronto para     │     │
       │   execucao)       │     │
       └────────┬──────────┘     │
                │                │
       ┌────────┼────────┐       │
       │        │        │       │
       ▼        ▼        ▼       │
    ┌──────┐ ┌──────┐ ┌──────┐  │
    │ P    │ │ M    │ │ G/XG │  │
    │/plan │ │/prd  │ │/prd  │  │
    │      │ │+valid│ │+tasks│  │
    │      │ │      │ │+waves│  │
    └──┬───┘ └──┬───┘ └──┬───┘  │
       │        │        │      │
       ▼        ▼        ▼      │
    ┌──────────────────────┐    │
    │  EXECUCAO             │    │
    │  eng-spec-workflow    │    │
    │  code-reviewer        │    │
    │  security-reviewer    │    │
    └──────────┬────────────┘    │
               │                │
               ▼                │
    ┌──────────────────────┐    │
    │  ATUALIZACAO DOCS     │    │
    │  TRACKING.md          │    │
    │  REGISTRO.md (FEITO)  │    │
    │  APROVADOS.md (exec.) │    │
    │  session log          │    │
    └──────────┬────────────┘    │
               │                │
               ▼                ▼
    ┌──────────────────────┐
    │  /audit-docs          │
    │  /fm-project-status   │
    └───────────────────────┘
```

---

## Disposição — o que fazemos com cada item em relação ao cliente

Eixo ortogonal a Tipo e Status, atribuído na triagem. Fonte da verdade completa:
a regra `agentic-loop` (seção Disposição).

| Disposição | Critério (primeiro que casar decide) | Cliente faz |
|------------|--------------------------------------|-------------|
| `COMUNICADO` | Bug confirmado sem decisão de produto em aberto; obrigação legal/a11y/segurança; entendimento do plano | Nada — toma ciência |
| `BLOQUEIO` | Depende de resposta/insumo de terceiro | Destrava (dono + prazo) |
| `FORA_DE_ESCOPO` | Comercial/administrativo/terceiro | Nada — só rastreado |
| `PROPOSTA` | Ideia sem decisão na fonte, ou sugestão nossa (INFERIDO) | Lê; autoriza evolução, não execução |
| `LOTE` | Ajuste visual/copy XS/S sem mudança de regra de negócio | 1 decisão por pacote `PKG-{tema}-{seq}` |
| `VALIDAR` | Requisito novo / mudança de comportamento, fonte identificável | 1 decisão individual |
| Ambíguo | **default `VALIDAR`** — nunca rebaixar em silêncio | — |

Regras-chave:
- **Bug não pede aprovação — comunica.** Se a correção admite mais de um comportamento válido, aí é `VALIDAR`.
- **Verbatim**: card `VALIDAR`/`PROPOSTA` declara `DITO` (citação exata + falante + timestamp obrigatórias) ou `INFERIDO` (campo Base da Inferência; nunca fingir citação). `INFERIDO` nunca nasce `VALIDAR` — nasce `PROPOSTA`.
- **Status `EM_VALIDACAO`**: item dentro de um doc de validação enviado, aguardando retorno (`TRIADO → EM_VALIDACAO → APROVADO`; "ajustar" volta a `TRIADO` com nota).
- **Propostas** vivem em seção própria do REGISTRO.md ("Propostas em lapidação"), ciclo `EM_DESENHO → PROPOSTA_ENVIADA → APROVADA/ARQUIVADA`.
- **Roteamento de verificação**: 5D completa (opus) só para `VALIDAR` e `PROPOSTA` promovida; `COMUNICADO`/`LOTE` recebem verificação leve na sessão, sem subagente.
- **Doc de validação** (skill `client-validation`, HTML interativo com export): instrumento de coleta em enterprise/legado. **A ata continua obrigatória** — registra o resultado. `validation_ref` (`VALID-{data}-{slug}`) liga doc + ata + cards.
- **Doc de entrega** (skill `client-delivery`, mesma moeda no fim do ciclo): módulo/wave concluído gera `ENTREGA-{data}.html` — por item: o pedido (com citação), o que foi construído, como foi testado (agregado de docs/testes/), link/evidência para auditar, e decisão dupla "Confirmo entregue / Encontrei problema". Status **EM_ACEITE** enquanto aguarda; em enterprise, **FEITO = aceito pelo cliente** (`delivery_ref` `ENTREGA-{data}-{slug}` liga doc + ata de aceite + cards).
- **Entrega sem evidência de teste não vai ao cliente**: item sem docs/testes/`<slug>`-ia.md (ou evidência equivalente) não entra no doc de entrega.

---

## Gatilhos — Quando Usar Cada Comando

### Entradas de Input

| Gatilho | O que voce recebe | Comando | Resultado |
|---------|-------------------|---------|-----------|
| Audio de reuniao | .ogg, .mp3, .m4a | `audio-transcription` | docs/reunioes/transcricoes/*.txt |
| Transcricao pronta | .txt, .vtt, .srt | `/fm-meeting-process` | docs/reunioes/atas/*.md + action items |
| Texto solto (WhatsApp, email) | texto | `/fm-classify` | Items classificados por tipo/urgencia |
| Ideia verbal do usuario | texto | `/verify-requirement` | Verificacao 5D direta |
| Edital/contrato novo | PDF/DOCX | Salvar em docs/escopo/ + indexar FONTES | Fonte registrada |
| Multiplos requisitos de uma vez | texto/lista | `/loop-verify-requirements` | Batch: classify + verify + triage |

### Processamento

| Gatilho | Situacao | Comando | Resultado |
|---------|----------|---------|-----------|
| Requisitos classificados | Apos /fm-classify | `/fm-triage` | Priorizacao RICE |
| Requisito individual | Qualquer momento | `/verify-requirement` | Score 5D + relatorio |
| Batch de requisitos | Pos-reuniao, pos-edital | `/loop-verify-requirements` | Scores + triagem |
| 2+ fontes de escopo | Ao indexar documentos | Detectar conflitos | FONTES-DE-ESCOPO.md atualizado |
| Conflito detectado | Cruzamento de fontes | Resolver com stakeholder | Ata em docs/escopo/atas-aprovacao/ |
| Score >= 40 (bazuca) | Pos-verificacao | Aprovar direto | APROVADOS.md |
| Score >= 40 (enterprise) | Pos-verificacao | Gerar ata + aprovar | Ata + APROVADOS.md |
| VALIDAR/LOTE prontos p/ cliente | Pós-triagem (enterprise/legado) | `/fm-validation-doc` | docs/requisitos/validacao/VALIDACAO-*.html + status EM_VALIDACAO |
| Retorno do cliente (texto exportado) | Após validação | `/fm-validation-process` | REGISTRO atualizado + ata + APROVADOS.md + proposta de waves |

### Planejamento

| Gatilho | Esforco estimado | Comando | Resultado |
|---------|-----------------|---------|-----------|
| Requisito aprovado, esforco P | < 1 dia | `/plan` | Plano direto, executar |
| Requisito aprovado, esforco M | 1-3 dias | `/pm-prd` + `/pm-validate-prd` | PRD validado |
| Requisito aprovado, esforco G/XG | > 3 dias | `/pm-prd` + `/pm-task-decompose` | Tasks + waves |
| Multiplos requisitos aprovados | Qualquer | `/wave-execute` | Execucao paralela |

### Verificacao Continua

| Gatilho | Quando | Comando/Agent | Resultado |
|---------|--------|---------------|-----------|
| Codigo escrito/modificado | Automatico | `code-reviewer` | Review de qualidade |
| Toca em auth/dados | Automatico | `security-reviewer` | Review de seguranca |
| Task concluida | A cada task | `project-docs-guardian` | TRACKING.md atualizado |
| Final de sessao | Automatico (hook Stop) | `session-logger` | docs/sessoes/*.md |
| Sprint concluida | Periodico | `/audit-docs` | Relatorio de saude |
| Entrega para stakeholder | Milestone | `/fm-project-status` | Status report |

---

## Modo Misto (mesmo projeto, momentos diferentes)

Um projeto pode alternar modos ao longo do tempo:

```
Semana 1: Recebemos edital + contrato → ENTERPRISE
  - Indexar fontes, extrair requisitos, detectar conflitos
  - Verificacao 5D com D5 contratual
  - Ata de aprovacao com stakeholder

Semana 3: o cliente manda áudio pedindo ajuste → BAZUCA
  - Transcrever, classificar, verificar rapido
  - Se o pedido esta no escopo do contrato → aprovar direto
  - Se NAO esta no contrato → FLAG como "fora de escopo"
  - Decisao: absorver, cobrar extra, ou rejeitar

Semana 5: Reuniao ABDI com novos requisitos → ENTERPRISE
  - Processar ata, extrair requisitos
  - Cruzar com FONTES-DE-ESCOPO (edital original)
  - Novos requisitos da ABDI que NAO estao no edital = mudanca de escopo
  - Gerar ata de aprovacao com impacto em horas/custo

Semana 7: Bug report do usuario → BAZUCA
  - /verify-requirement direto
  - Score alto (bug claro), aprovar e corrigir
```

**Regra de deteccao**:
- Input tem origem em documento formal (edital, contrato, ata) → ENTERPRISE
- Input e verbal/informal (audio, WhatsApp, ideia) → BAZUCA
- Input verbal que CONTRADIZ documento formal → ENTERPRISE (conflito)

---

## Dimensao 5: Alinhamento (muda por modo)

### Modo Bazuca — Alinhamento Estrategico

| Criterio | Peso |
|----------|------|
| Alinhado com metas do projeto | 2 |
| Resolve problema conhecido | 2 |
| ROI justifica esforco | 2 |
| Sponsor claro | 2 |
| Urgencia real | 2 |

### Modo Enterprise — Alinhamento Contratual

| Criterio | Peso |
|----------|------|
| Esta no edital? | 2 |
| Esta no contrato? | 2 |
| Dentro das horas contratadas? | 2 |
| Tem deadline contratual? | 1 |
| Conflita com outra fonte? (nao = +2, sim = -2) | 2 |
| Stakeholder com autoridade pediu? | 1 |

Input que NAO esta no edital NEM no contrato recebe score baixo na D5,
independente de ser viavel tecnicamente. Isso protege contra scope creep.

---

## Modelos por Papel no Loop

| Papel | Modelo | Custo | Justificativa |
|-------|--------|-------|---------------|
| Transcricao | Whisper/faster-whisper | $0 (local) | Audio para texto |
| Classificacao (input-classifier) | Haiku 4.5 | $1/$5 MTok | Volume alto, custo baixo |
| Verificacao (requirement-verification-loop) | Opus 4.6 | $5/$25 MTok | Raciocinio multi-dimensional |
| Documentacao (project-docs-guardian) | Sonnet 4.6 | $3/$15 MTok | Balance qualidade/custo |
| Code review (code-reviewer) | Sonnet 4.6 | $3/$15 MTok | Padrao de execucao |
| Security review (security-reviewer) | Sonnet 4.6 | $3/$15 MTok | Analise focada |
| Deteccao de conflitos | Opus 4.6 | $5/$25 MTok | Cruzamento de fontes complexo |
| Loop longo autonomo | Opus 4.6 | $5/$25 MTok | Tarefas multi-hora |

---

## Regras Inegociaveis

1. **Nenhum requisito sem score**: Todo requisito `VALIDAR` (e `PROPOSTA` promovida) DEVE ter score 5D antes de APROVADO; `COMUNICADO`/`LOTE` recebem verificação leve registrada no card
2. **Nenhum requisito enterprise sem ata**: Se veio de documento formal, aprovacao gera ata
3. **O documento que o bloco `acompanhamento-docs` declarar é a verdade** (`rules/common/project-structure.md`), senão `TRACKING.md`: Atualizar ao final de CADA sessao
4. **Relatorios em arquivo**: Toda verificacao salva em docs/requisitos/verificacoes/
5. **Validacao humana entre fases**: NAO avancar automaticamente
6. **Security flag e bloqueio**: Se FLAG_SEGURANCA, security-reviewer ANTES de implementar
7. **Fora de escopo = FLAG**: Input que nao esta no edital/contrato DEVE ser flagado
8. **Conflito = PARAR**: Nao executar requisito com conflito nao resolvido
9. **Rastreabilidade total**: Todo requisito aponta para fonte (edital §X, ata Y, audio Z)
10. **Toda entrada no REGISTRO tem Disposição**: sem disposição válida, o item não avança no pipeline
11. **Bug não pede aprovação**: `COMUNICADO` entra no doc de validação como informe, nunca como decisão
12. **`INFERIDO` nunca nasce `VALIDAR`**: sugestão da equipe entra como `PROPOSTA` e só o cliente promove
13. **Em enterprise/legado, `VALIDAR` não vai a EM_EXECUCAO sem Validação-ref**: a decisão do cliente precisa estar registrada (doc + ata)
14. **Entrega sem evidência não vai ao cliente**: item sem teste registrado (docs/testes/) não entra no doc de entrega
15. **Em enterprise/legado, FEITO = aceito**: módulo concluído gera doc de entrega (`/fm-delivery-doc`); o card só vira FEITO com o campo Aceite preenchido pelo retorno (`/fm-delivery-process`)
