---
description: Gera o documento de entrega (HTML interativo) de um módulo concluído — pedido, construído, testado e link de auditoria por item, com aceite formal
---

# /fm-delivery-doc

Gera o documento de entrega de um módulo/wave concluído — padrão de delivery de todos os módulos
(metodologia §12).

## Processo

Carregar a skill `client-delivery` e executar o **modo GERAR** conforme o SKILL.md:

1. Ler `${CLAUDE_PLUGIN_ROOT}/skills/client-delivery/assets/template-entrega.html` (referência obrigatória)
2. Selecionar os REQs concluídos do módulo/wave (perguntar qual, se ambíguo)
3. Montar cada card com os 4 blocos: **O pedido** (breve + citação verbatim do card) →
   **O que foi construído** (do campo Execução) → **Como foi testado** (números reais de
   docs/testes/<slug>-ia.md + o que NÃO foi testado por máquina) → **Auditar** (link direto de
   produção, ou evidência embutida quando não há tela)
4. Seção "Fora desta entrega" (o que ficou de fora, motivo, destino)
5. Aplicar a identidade visual do PROJETO (roteamento de marca)
6. Salvar em `docs/requisitos/validacao/ENTREGA-{YYYY-MM-DD}.html` com `delivery_ref`
7. Atualizar REGISTRO.md: itens → `EM_ACEITE` + campo Entrega-ref
8. Verificar no browser: 320px, os 2 estados de decisão, **clicar todos os links de auditoria**

## Guarda

- Item sem evidência em docs/testes/ NÃO entra — volta e testa primeiro (regra 14)
- Números de teste reais, nunca estimados
- Sempre declarar o que NÃO foi testado por máquina
