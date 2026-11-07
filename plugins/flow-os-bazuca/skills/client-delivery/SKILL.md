---
name: client-delivery
description: >
  Gera e processa documentos de entrega (delivery) de módulos — a contraparte pós-execução do
  client-validation, na mesma moeda. Modo GERAR: REQs concluídos + docs/testes/ → HTML interativo
  onde cada item mostra o pedido original (com citação), o que foi construído, como foi testado e
  o link/evidência para auditar, com aceite formal por item. Modo PROCESSAR: retorno colado
  (REF: ENTREGA-...) → ACEITO vira FEITO com campo Aceite; PROBLEMA volta a EM_EXECUCAO com a
  observação; ata de aceite gerada. Use quando: "documento de entrega", "doc de delivery",
  "entregar o módulo", "gerar entrega para o cliente", "o cliente respondeu o aceite",
  "processar aceite da entrega".
origin: custom
version: 1.0.0
triggers:
  - documento de entrega
  - doc de delivery
  - entregar módulo
  - aceite de entrega
  - processar aceite
---

# Client Delivery

Padrão de entrega de todos os módulos: o documento de validação pergunta "posso fazer?"; este
mostra **"fiz, aqui está a prova, confira"**. Fonte da verdade:
a regra `agentic-loop` (seção Disposição) (seção 12).
Insumo obrigatório: os documentos de `docs/testes/` (PADRAO-VALIDACAO.md — `<slug>-ia.md` +
`<slug>-manual.md`), que este doc AGREGA, não substitui.

**Pré-requisito**: os itens do módulo estão concluídos (implementados + testados + deployados) e
têm evidência em `docs/testes/`. **Item sem evidência de teste NÃO entra no doc** — voltar e
testar primeiro (regra 14 da agentic-loop).

---

## Modo GERAR (`/fm-delivery-doc`)

### Passos

1. **Ler o template primeiro**: `assets/template-entrega.html` (deste diretório) — estrutura,
   mecânica JS e placeholders. Copiar e preencher, não escrever do zero.
2. **Selecionar os itens da entrega**: REQs do módulo/wave concluído (status EM_EXECUCAO
   finalizados ou FEITO interno aguardando formalização). Perguntar ao usuário qual módulo/wave
   se ambíguo.
3. **Montar cada card com os 4 blocos obrigatórios**:
   | Bloco | Fonte |
   |-------|-------|
   | **O pedido** — breve descrição da reclamação/pedido + citação verbatim | Card do REGISTRO.md (Citação; se INFERIDO, Base da Inferência com a marcação "item proposto por nós") |
   | **O que foi construído** — breve, concreto (o que existe agora) | Campo Execução do card |
   | **Como foi testado** — testes de máquina com números reais + `li.not` para o que NÃO foi testado por máquina + o que o humano validou | `docs/testes/<slug>-ia.md` e `<slug>-manual.md` |
   | **Auditar** — 1 frase do que conferir + link direto da tela/fluxo em produção (`.audit-link`); sem tela → `<details class="evidence">` com screenshot/output embutido (auto-contido) | `<slug>-manual.md` / evidências da sessão |
4. **Seção "Fora desta entrega"**: itens do módulo que ficaram de fora, com motivo e destino —
   honestidade sobre o corte.
5. **Gerar `delivery_ref`**: `ENTREGA-{YYYY-MM-DD}-{slug-projeto}`. Preencher a constante `REF`,
   o rodapé e o nome do arquivo.
6. **Marca**: Roteamento de Marca (CLAUDE.md global) — cliente externo = brief do projeto;
   preencher a ZONA DE MARCA, nunca deixar os valores de exemplo.
7. **Salvar** em `{projeto}/docs/requisitos/validacao/ENTREGA-{YYYY-MM-DD}.html`.
8. **Atualizar o REGISTRO.md**: cada item incluído muda para `EM_ACEITE ({data})` e ganha
   `**Entrega-ref** | ENTREGA-...`.
9. **Modo legado**: `pt-br-proofreader` sobre o texto visível antes do envio.
10. **Verificar antes de entregar**: abrir no browser, 320px sem overflow, clicar os 2 estados,
    testar TODOS os links de auditoria (clicar cada um — link quebrado no doc de entrega mina a
    confiança inteira), gerar o resumo e conferir a linha `REF:`.

### Guardas

- Item sem `<slug>-ia.md` nem evidência equivalente → fica de fora + entra em "Fora desta
  entrega" com motivo "sem evidência de teste — pendente".
- Números de teste são REAIS (colados dos docs/testes ou da execução) — nunca estimados.
- O bloco "Como foi testado" SEMPRE inclui pelo menos 1 item `li.not` (o que não foi testado por
  máquina) — é o que dá credibilidade ao resto.

## Modo PROCESSAR (`/fm-delivery-process`)

Entrada: o texto exportado pelo botão "Gerar resumo do aceite" (começa com `REF: ENTREGA-...`).

### Passos

1. **Validar `REF:`** contra os Entrega-ref conhecidos (REGISTRO.md ou arquivos ENTREGA-*.html).
   Sem REF válida → perguntar; nunca adivinhar.
2. **Preservar o bruto**: `docs/requisitos/validacao/ACEITE-{YYYY-MM-DD}.txt`.
3. **Aplicar transições**:
   | Retorno | Transição no REGISTRO.md |
   |---------|--------------------------|
   | `[ACEITO]` | `EM_ACEITE → FEITO ({data})`; campo **Aceite** = "{quem}, {data}, {delivery_ref}" |
   | `[PROBLEMA]` | `EM_ACEITE → EM_EXECUCAO`; a `obs:` é anexada ao campo Execução como "Contestação ({data}): ..." — o escopo NÃO reabre, a execução sim |
   | `[SEM RESPOSTA]` | permanece `EM_ACEITE` (o validation-tracker cobra) |
4. **Gerar a ata de aceite** (enterprise/legado, obrigatória):
   `docs/escopo/atas-aprovacao/ATA-{YYYY-MM-DD}-aceite.md` — delivery_ref, quem respondeu,
   tabela (ID, título, decisão, obs), pendências que permanecem.
5. **Resumir**: N aceitos (fechados), N com problema (reabertos, com as obs), N sem resposta.
   Para os reabertos, propor o próximo passo (corrigir → nova rodada de entrega só com eles).

## Gradação por modo

| Modo | Doc de entrega | Ata de aceite | Extra |
|------|----------------|---------------|-------|
| Bazuca | Opcional (entrega verbal + docs/testes) | Opcional | — |
| Enterprise | Obrigatório ao concluir módulo/wave | Obrigatória | FEITO = aceito |
| Legado | Obrigatório | Obrigatória | pt-br-proofreader antes do envio |

## Armadilhas conhecidas

- **Link de auditoria quebrado** destrói a credibilidade do doc inteiro — testar cada link no
  browser antes de entregar (passo 10).
- **Screenshot embutido**: usar data URI (base64) para o doc ser auto-contido; comprimir antes
  (o doc não deve passar de ~2-3 MB).
- **REF é contrato**: mudar nome do arquivo sem mudar a constante REF quebra o processamento.
- Cliente respondeu por texto livre em vez do export? Processar mesmo assim mapeando manualmente
  para as transições — e registrar o texto em ACEITE-{data}.txt do mesmo jeito.
