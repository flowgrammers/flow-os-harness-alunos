---
description: Registra item aprovado no REGISTRO.md com ID único e métricas atualizadas
---
# /fm-requirement-register

## O que essa skill faz

Registra um item aprovado no REGISTRO.md do projeto com todos os campos obrigatorios, atribui ID unico e atualiza metricas. Replica o padrao de um projeto real de gestao de requisitos.

---

## Quando usar

- Apos `/fm-triage` quando item foi aprovado
- Para registrar requisito de reuniao diretamente
- Quando precisa formalizar demanda no escopo do projeto
- Para atualizar status de requisito existente

---

## Input esperado

**Minimo:**
- Titulo do requisito
- Projeto destino
- Fonte (reuniao/whatsapp/backlog + referencia)

**Opcional:**
- Item classificado do `/fm-classify` (preenche campos automaticamente)
- Status inicial (default: LISTADO)
- Esforco estimado
- Responsavel

**Modo update:**
- ID do requisito existente
- Novo status + detalhes

---

## Processo

### Novo requisito:

1. **Localizar REGISTRO.md** do projeto em `{projeto}/docs/requisitos/REGISTRO.md`
2. **Se nao existe**: criar com template padrao (ver skill `requirement-tracking`)
3. **Gerar ID**: `{FonteCodigo}-{Sequencial}` baseado na fonte
4. **Verificar duplicatas**: buscar requisitos similares no REGISTRO existente
5. **Adicionar entrada** com todos os campos obrigatorios
6. **Atualizar metricas** no topo do REGISTRO.md
7. **Confirmar** ao usuario com ID e resumo

### Update de status:

1. **Localizar requisito** pelo ID no REGISTRO.md
2. **Atualizar campo Status** com data: ex: "FEITO (11/06/2026)"
3. **Preencher campo Execucao** se status = FEITO
4. **Preencher justificativa** se status = REJEITADO/ADIADO
5. **Atualizar metricas**

---

## Estrutura de Pastas

```
{projeto}/
└── docs/
    └── requisitos/
        ├── REGISTRO.md          # Fonte da verdade
        └── CONSOLIDADO.md       # Visao por reuniao (gerado por /fm-requirement-consolidate)
```

Se a pasta nao existir, criar automaticamente.

---

## Template do Requisito

```markdown
### {ID}: {Titulo descritivo}

| Campo | Valor |
|-------|-------|
| **Fonte** | {Codigo} ({timestamp/ref}) — {Participante} |
| **Tipo** | {Feature / Bug / Polish / Infra / Processo} |
| **Aderencia** | {Aderente/Parcial/Nao aderente} — {justificativa} |
| **Status** | {LISTADO} |
| **Esforco** | {estimativa} |
| **Risco** | {ALTO/MEDIO/BAIXO} — {descricao} |
| **Triagem** | {avaliacao do PM} |
| **Aprovacao** | {pendente} |
| **Execucao** | {pendente} |
```

---

## Output

```markdown
## Requisito Registrado

- **ID**: {ID}
- **Titulo**: {titulo}
- **Projeto**: {projeto}
- **Status**: {status}
- **Arquivo**: `{path}/REGISTRO.md`

### Metricas Atualizadas
| Total | LISTADO | TRIADO | APROVADO | EM_EXECUCAO | FEITO | REJEITADO | ADIADO |
|-------|---------|--------|----------|-------------|-------|-----------|--------|
| N | N | N | N | N | N | N | N |
```

---

## Regras

1. **ID imutavel** — uma vez atribuido, nunca reutilizar
2. **Verificar duplicatas** antes de criar novo requisito
3. **Toda mudanca de status inclui data**
4. **REJEITADO exige justificativa**
5. **ADIADO exige condicao de retorno**
6. **Metricas sempre atualizadas** apos qualquer mudanca
7. **Se REGISTRO.md nao existe, criar** com template completo

---

## Exemplo

**Input:**
```
/fm-requirement-register
Titulo: Implementar autenticacao por email
Projeto: Atlas
Fonte: R5 (01:23:45) — Paolo
Tipo: Feature
Esforco: 16h
```

**Output:**
```
## Requisito Registrado

- **ID**: R5-14
- **Titulo**: Implementar autenticacao por email
- **Projeto**: Atlas
- **Status**: LISTADO
- **Arquivo**: `atlas/docs/requisitos/REGISTRO.md`

Proximo passo: Execute `/fm-triage` para triagem ou atualize status para TRIADO.
```
