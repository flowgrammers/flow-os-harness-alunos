---
name: client-validation
description: >
  Gera e processa documentos de validação de requisitos com cliente (padrão DBIA/Plataforma
  canonizado). Modo GERAR: REGISTRO.md + triagem → HTML interativo agrupado por Disposição
  (comunicados sem decisão, pacotes com decisão única, requisitos com decisão individual,
  propostas em estudo) com export textual. Modo PROCESSAR: retorno colado do cliente →
  REGISTRO.md atualizado + ata de aprovação + APROVADOS.md + proposta de waves.
  Use quando: "documento de validação", "validar requisitos com o cliente", "gerar doc de
  validação", "processar retorno da validação", "o cliente respondeu a validação".
origin: custom
version: 1.0.0
triggers:
  - documento de validação
  - validar requisitos com cliente
  - doc de validação
  - processar retorno de validação
  - validação do plano de execução
---

# Client Validation

Instrumento de coleta de decisões do cliente sobre requisitos, em duas operações. Fonte da
verdade da metodologia: a regra `agentic-loop` (seção Disposição).
Regra-mãe: `${CLAUDE_PLUGIN_ROOT}/rules/common/agentic-loop.md` (seção "Disposição").

**Pré-requisito**: os itens do REGISTRO.md têm o campo **Disposição** preenchido (triagem feita).
Se não têm, rodar a triagem primeiro (`/fm-classify` + `/fm-triage`) — não inventar disposições
na hora de gerar o doc.

---

## Modo GERAR (`/fm-validation-doc`)

### Passos

1. **Ler o template primeiro**: `assets/template.html` (deste diretório). Ele é a referência de
   estrutura, mecânica JS e placeholders — copiar e preencher, não escrever HTML do zero.
2. **Ler as fontes**: `docs/requisitos/REGISTRO.md` do projeto (+ triagem em
   `docs/requisitos/verificacoes/TRIAGEM-*.md` se existir, + auditoria de origem se citada).
3. **Selecionar os itens da rodada**: status `TRIADO` com disposição definida (e `COMUNICADO`
   já aprovados que ainda não foram comunicados). Perguntar ao usuário se a rodada deve incluir
   tudo ou um subconjunto (ex.: só uma reunião).
4. **Agrupar por Disposição** nas 10 seções do template:
   - `BLOQUEIO` → seção 02 (dono + prazo)
   - `COMUNICADO` → seção 03 (sem botões, com nota "executamos e reportamos")
   - `LOTE` → seção 04 (1 card por `PKG-*` com checklist dos itens absorvidos)
   - `VALIDAR` sem dependência aberta → seção 05 (Execução imediata)
   - `VALIDAR` travado por bloqueio → seção 06 (Aguardando decisão, botões adaptados)
   - `PROPOSTA` → seção 07 (Em estudo, tabela sem botões)
   - `FORA_DE_ESCOPO` → NÃO entra no doc (fica só no REGISTRO)
   - Seções vazias são removidas por inteiro.
5. **Card VALIDAR completo** (anatomia obrigatória): ID + título imperativo + explicação
   profunda (o que é, por quê, o que muda) + citação verbatim com falante e timestamp
   (`Verbatim: DITO`) OU base da inferência (`Verbatim: INFERIDO`, bloco `.inference`) +
   chips de esforço/risco/dependências + âncora técnica quando fizer sentido.
   **Nunca inventar citação.** Se o card do REGISTRO não tem citação e é DITO, voltar à
   transcrição/fonte e buscar o trecho — ou rebaixar a INFERIDO com base explícita.
6. **Gerar `validation_ref`**: `VALID-{YYYY-MM-DD}-{slug-projeto}` (data de hoje). Preencher a
   constante `REF` do script, o rodapé, e o nome do arquivo.
7. **Marca**: aplicar o Roteamento de Marca (CLAUDE.md global). Projeto externo/cliente =
   identidade do brief do projeto (paleta, fonte). Interno = skill de marca
   correspondente. Preencher a ZONA DE MARCA do `:root` — nunca deixar os valores de exemplo.
8. **Salvar** em `{projeto}/docs/requisitos/validacao/VALIDACAO-{YYYY-MM-DD}.html` (criar a
   pasta se não existir).
9. **Atualizar o REGISTRO.md**: cada item incluído (exceto COMUNICADO) muda para status
   `EM_VALIDACAO ({data})` e ganha `**Validação-ref** | VALID-...`. COMUNICADO permanece
   APROVADO e ganha a Validação-ref (rastreia onde foi comunicado).
10. **Modo legado**: rodar o agent `pt-br-proofreader` sobre o texto visível do HTML antes de
    considerar pronto para envio.
11. **Verificar antes de entregar**: abrir o HTML no browser, testar 320px (sem overflow
    horizontal), clicar os 3 estados de um item, gerar o resumo e conferir a linha `REF:`.

### Contagens de sanidade

- Total de decisões do statusbar = itens das seções 04+05+06 (nunca 03 nem 07).
- Se o número de decisões passar de ~25, questionar a triagem: há COMUNICADO ou LOTE demais
  pedindo decisão individual? A meta do padrão é reduzir a lista à metade, não inflá-la.

---

## Modo PROCESSAR (`/fm-validation-process`)

Entrada: o texto exportado pelo botão "Gerar resumo" (colado pelo usuário no chat ou em arquivo).

### Passos

1. **Validar o cabeçalho `REF:`** contra os `validation_ref` conhecidos do projeto (campo
   Validação-ref no REGISTRO.md ou nome dos arquivos em `docs/requisitos/validacao/`).
   Sem `REF:` válida → perguntar ao usuário de qual doc é o retorno; nunca adivinhar.
2. **Preservar o bruto**: salvar o texto colado em
   `docs/requisitos/validacao/RETORNO-{YYYY-MM-DD}.txt` antes de qualquer processamento.
3. **Aplicar transições por linha** `[STATUS] {ID} - {título}`:
   | Retorno | Transição no REGISTRO.md |
   |---------|--------------------------|
   | `[APROVADO]` | `EM_VALIDACAO → APROVADO ({data})`; campo Aprovação = "Validação {validation_ref}" |
   | `[AJUSTAR]` | `EM_VALIDACAO → TRIADO`; nota do cliente (`obs:`) anexada ao campo Triagem; item volta ao ciclo |
   | `[NAO FAZER]` | `EM_VALIDACAO → REJEITADO ({data})`; `obs:` vira a justificativa obrigatória |
   | `[SEM RESPOSTA]` | permanece `EM_VALIDACAO` (o n8n validation-tracker cobra) |
   | `[CIENTE]` (comunicados) | nenhuma transição; registrar ciência na Aprovação do card |
   - `PKG-*` aprovado/rejeitado propaga a decisão para TODOS os itens absorvidos (cards
     individuais do REGISTRO). `[AJUSTAR]` em pacote: ler a `obs:` — se remove um item
     específico, esse item volta a TRIADO e o restante segue aprovado.
4. **Gerar a ata** (enterprise/legado, obrigatória): 
   `docs/escopo/atas-aprovacao/ATA-{YYYY-MM-DD}-validacao.md` com: validation_ref, data,
   quem respondeu, tabela de decisões (ID, título, decisão, obs), comunicados dados como
   ciência, pendências que permanecem. Em bazuca: opcional, oferecer.
5. **Regenerar APROVADOS.md** (mesma lógica do `/fm-generate-aprovados`).
6. **Propor waves**: agrupar os novos APROVADO por dependência/tema e propor ordem de execução
   (não executar — propor).
7. **Resumir para o usuário**: N aprovados, N a ajustar (com as obs), N rejeitados, N sem
   resposta (cobrados pelo validation-tracker).

---

## Gradação por modo

| Modo | Doc | Ata | Extra |
|------|-----|-----|-------|
| Bazuca | Opcional (aprovação verbal no card dispensa) | Opcional | — |
| Enterprise | Obrigatório p/ VALIDAR e LOTE novos | Obrigatória | — |
| Legado | Obrigatório | Obrigatória | pt-br-proofreader antes do envio |

## Armadilhas conhecidas

- **Não pedir decisão sobre bug**: se um COMUNICADO acabou numa seção com botões, a triagem
  errou — corrigir a disposição no REGISTRO antes de gerar.
- **Encoding**: HTML com `<meta charset="UTF-8">` e acentuação correta em todo texto visível;
  nome de arquivo ASCII.
- **REF é contrato**: mudar o slug/data do arquivo sem mudar a constante `REF` quebra o
  processamento do retorno.
- **localStorage por REF**: cada rodada tem chave própria — reenviar um doc corrigido com a
  MESMA REF preserva as respostas já dadas pelo cliente (comportamento desejado); rodada nova
  = REF nova.
