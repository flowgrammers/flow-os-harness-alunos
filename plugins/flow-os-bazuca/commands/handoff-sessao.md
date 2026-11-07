---
description: Monta (ou completa) o handoff da sessão atual em docs/handoffs/ — o documento que permite a próxima sessão continuar sem reler o transcript. Construção incremental a partir dos 65% de contexto.
---

# Handoff de sessão

Escreve, no repositório do projeto, **todo e apenas** o necessário para outra sessão continuar
de onde esta parou — e atualiza os documentos de acompanhamento junto.

É o H3 do REQ-239. A regra que o rege é `${CLAUDE_PLUGIN_ROOT}/rules/common/context-budget.md`.

## Quando rodar

- **Ao cruzar 65% de contexto** — o hook `context-budget-warn.js` avisa. Nesse momento você cria o
  **esqueleto**, ainda incompleto, e segue trabalhando.
- **A cada tarefa fechada depois disso** — você volta e completa a linha correspondente.
- **Ao encerrar** — fecha o que faltou.

Deixar para escrever no fim é apostar que vai haver fim. O contexto pode acabar antes, e aí não
sobra nem o documento. **Se o arquivo do dia já existe, ATUALIZE — não crie um segundo.**

## Este comando não é nenhum dos parentes

Já existem três coisas parecidas, e confundi-las gera documento duplicado que ninguém lê:

| Existente | O que faz | Por que não serve aqui |
|---|---|---|
| `/save-session` | Grava o que aconteceu em `~/.claude/session-data/` | Fica na máquina, não no repo, e é **histórico** — registra o passado em vez de habilitar a continuação |
| `session-logger` (hook) | Log automático em `docs/sessoes/` | Idem: relato, não continuação |
| `npm run handoff` (REQ-140) | Transfere um **projeto entre pessoas** | É onboarding de builder, não retomada de tarefa |

O handoff desta skill é **para a próxima sessão**, não para outra pessoa, e vive versionado no
repositório para sobreviver à máquina.

## Onde escrever

`docs/handoffs/HANDOFF-{AAAA-MM-DD}-{slug-curto-do-tema}.md`

Se `docs/handoffs/` não existir, crie.

## Quais documentos atualizar junto

Leia o `CLAUDE.md` do projeto procurando este bloco:

```
<!-- handoff-docs: início -->
- TRACKING.md
- docs/RETOMADA.md
<!-- handoff-docs: fim -->
```

- **Com o bloco**: atualize exatamente os arquivos listados.
- **Sem o bloco**: o padrão é `TRACKING.md` e `docs/RETOMADA.md`, e só os que já existirem.

**A auto-memory fica de fora.** Memória é curadoria: o que vira permanente é decisão do humano,
não subproduto de um limiar. Se algo merecer virar memória, **proponha** ao final — não grave.

## O que o documento contém

Cinco blocos. Nada além deles, e nenhum vazio.

1. **Onde parei** — a tarefa em andamento e em que passo exatamente. Uma tabela por frente, com
   estado. Se uma frente tem ondas, diga qual onda acabou e qual não começou.
2. **O próximo passo concreto** — o que a próxima sessão faz primeiro, com o caminho dos arquivos
   e as decisões que **já** foram tomadas para não serem redescobertas.
3. **Decisões desta sessão que não se rediscutem** — tabela `decisão → onde está registrada`.
4. **Verificação** — os comandos que dizem se o estado ainda é o mesmo, com o resultado esperado
   ao lado. Sem isso, a próxima sessão gasta contexto reconferindo.
5. **O que não funcionou** — as tentativas que falharam e por quê. É o bloco que mais economiza
   tempo, e o mais esquecido.

Quando houver dívida criada por você nesta sessão, acrescente um sexto bloco dizendo isso na cara.
Um sétimo bloco — **o que já está pronto e não precisa ser reconferido** — evita que a próxima
sessão gaste contexto revalidando o que já tem teste.

## O que NÃO entra

- Narrativa do que foi feito ao longo da sessão (para isso existem os commits)
- Transcrição de raciocínio
- Contexto que a próxima sessão consegue reler sozinha abrindo um arquivo
- Números sem fonte — se disser "63,4%", diga de onde saiu

**A régua**: a próxima sessão consegue retomar **sem abrir o transcript desta**? Se não, falta
alguma coisa. Se tem parágrafo que não ajuda a retomar, sobra.

## Passos

1. Descubra a ocupação atual, se der (`scripts/lib/context-window.js`, quando o pacote tiver, ou o aviso que o
   hook já entregou). Registre-a no cabeçalho: serve para calibrar o limiar depois.
2. Veja se já existe handoff de hoje em `docs/handoffs/`. Se sim, **atualize**.
3. Escreva os cinco blocos com o que você sabe agora. Bloco sem conteúdo ainda: escreva
   `_(em aberto)_` em vez de omitir — a lacuna visível é informação.
4. Atualize os documentos de acompanhamento declarados.
5. Diga ao usuário, em uma linha, onde ficou o arquivo e o que ainda está `_(em aberto)_`.

## Modelo

```markdown
# Handoff de sessão — {AAAA-MM-DD}

**Ocupação ao escrever**: {N}% ({faixa}) · **Tema**: {frase curta}

> Contém o necessário para **continuar**. Não é relato do que foi feito — para isso existem os
> commits.

## 1. Onde parei

| Frente | Estado |
|---|---|
| {frente} | {feito / em andamento no passo X / não começou} |

## 2. O próximo passo concreto

{O que fazer primeiro, com caminho de arquivo. As decisões já tomadas, para não redescobrir.}

## 3. Decisões desta sessão — não rediscutir

| Decisão | Onde está registrada |
|---|---|
| {decisão} | {arquivo / ADR / commit} |

## 4. Verificação — o estado ainda é este?

```bash
{comando}   # esperado: {resultado}
```

## 5. O que não funcionou (não repita)

- **{tentativa}** — {por que falhou}

## 6. Dívida que eu mesmo criei

- {o que ficou pior por decisão minha, e o que custaria consertar}

## 7. O que já está pronto e não precisa ser reconferido

| Artefato | Verificação que o cobre |
|---|---|
| {arquivo} | {teste / evidência} |
```
