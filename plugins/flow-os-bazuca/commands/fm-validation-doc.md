---
description: Gera o documento de validação de requisitos (HTML interativo) a partir do REGISTRO.md, agrupado por Disposição
---

# /fm-validation-doc

Gera o documento de validação para o cliente decidir requisitos — padrão canonizado dos casos
DBIA (18/07/2026) e Plataforma de Letramento (20/07/2026).

## Processo

Carregar a skill `client-validation` e executar o **modo GERAR** conforme o SKILL.md:

1. Ler `${CLAUDE_PLUGIN_ROOT}/skills/client-validation/assets/template.html` (referência obrigatória)
2. Ler `docs/requisitos/REGISTRO.md` (+ triagem, se existir) do projeto atual
3. Agrupar itens por **Disposição**: comunicados (sem decisão), pacotes (decisão única),
   requisitos (decisão individual com citação verbatim), propostas (em estudo, sem botões)
4. Aplicar a identidade visual do PROJETO (roteamento de marca — cliente externo = brief)
5. Salvar em `docs/requisitos/validacao/VALIDACAO-{YYYY-MM-DD}.html` com `validation_ref`
6. Atualizar status dos itens para `EM_VALIDACAO` + campo Validação-ref no REGISTRO.md
7. Verificar no browser (320px sem overflow, decisões clicáveis, resumo com linha `REF:`)

## Pré-requisito

Itens com Disposição atribuída (triagem feita). Sem disposição → rodar `/fm-classify` +
`/fm-triage` antes; este comando NÃO inventa disposições.

## Guarda

- Bug (`COMUNICADO`) nunca aparece com botões de decisão
- `PROPOSTA` nunca aparece com botões de execução
- Citação verbatim obrigatória em card `DITO`; nunca inventada
