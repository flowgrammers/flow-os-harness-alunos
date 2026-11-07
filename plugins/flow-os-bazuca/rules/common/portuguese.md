# Português pt-BR — acentuação e encoding

> Fundida em 2026-09-03 (REQ-255) a partir de `portuguese.md` e `portuguese-accents.md`, que somavam
> 1.953 palavras com 36 termos duplicados e abriam a tabela de exemplos com `| gestao | gestao |`.
> A lista completa de formas sem acento mora em **um** lugar: `BARE_WORDS` no hook
> `${CLAUDE_PLUGIN_ROOT}/scripts/hooks/guard-pt-br-accents.js`. Esta regra diz o quê; o hook confere.

## A regra

Todo texto em pt-BR que uma pessoa lê sai **com acento**: prosa de `.md`, `.txt` e `.html`, strings de
interface, mensagens de log e de commit, comentários de código. O modelo tende a omitir acentos em arquivos
longos e depois de compactação de contexto (issues #63729, #32886 e #12417 do Claude Code); a regra existe
porque o defeito é conhecido, não hipotético.

Fica em ASCII, sem acento: **nomes de arquivo** (`gestao.md`), **identificadores de código** (`getGestaoAtiva`,
`configuracao`), **chaves de JSON** e **colunas de banco**.

Ao editar um arquivo que já tem acentos, preserve todos: uma edição parcial nunca "normaliza" para ASCII.

## Os pares que mais erram

| Sem acento (proibido em prosa) | Correto |
|---|---|
| nao, sao, entao, tambem, voce, ate, apos, porem, ja, so | não, são, então, também, você, até, após, porém, já, só |
| gestao, sessao, versao, decisao, padrao, razao | gestão, sessão, versão, decisão, padrão, razão |
| acao, funcao, operacao, configuracao, execucao, integracao | ação, função, operação, configuração, execução, integração |
| validacao, autenticacao, implementacao, documentacao, atualizacao | validação, autenticação, implementação, documentação, atualização |
| servico, preco, licenca, comeco, forcado | serviço, preço, licença, começo, forçado |
| unico, publico, tecnico, automatico, historico, especifico, numero, ultimo | único, público, técnico, automático, histórico, específico, número, último |
| usuario, necessario, obrigatorio, relatorio, repositorio, diretorio | usuário, necessário, obrigatório, relatório, repositório, diretório |
| area, saude, pais, frequencia, experiencia, referencia | área, saúde, país, frequência, experiência, referência |
| a medida que, as vezes (crase) | à medida que, às vezes |

Regra prática: terminação em `-ção`, `-ão` (substantivo), `-ário`/`-ório` e toda proparoxítona levam acento.
Dúvida: [Priberam](https://dicionario.priberam.org/). O projeto é **pt-BR**; não misturar vocabulário pt-PT
(equipa, telemóvel, autocarro).

## Encoding

- Arquivos em **UTF-8 sem BOM**. No Windows, `chcp 65001` no terminal; o que parece corrupção no terminal
  (`Ã£` no lugar de `ã`) costuma ser o code page 850 exibindo bytes UTF-8 corretos — confira o arquivo,
  não o eco.
- Git: `core.quotepath false`, `i18n.commitencoding utf-8`, `i18n.logoutputencoding utf-8`. Line endings
  por repositório via `.gitattributes` (`* text=auto eol=lf`), não por config global.
- PowerShell 5.1 e o Bash do Windows mutilam strings com acento, crase e `$` passadas inline: conteúdo
  com acento vai por arquivo (Write, ou um `.js` rodado com `node`), nunca por here-string.

## O hook que confere

`guard-pt-br-accents.js` roda em `PostToolUse` para `Write|Edit` (ligado no `settings.json`): em `.md`,
`.txt` e `.mdx` varre o conteúdo inteiro; em `.html`, `.tsx`, `.jsx`, `.vue`, `.svelte` e `.astro` varre só
texto visível e literais de string, porque identificador em pt-BR é ASCII por regra. Ele **avisa e não
bloqueia** (exit 0): o aviso aparece no transcript, não no contexto do modelo — para chegar ao agente o
hook teria de sair com 2, decisão ainda não tomada. Enquanto isso, a checagem antes de encerrar é sua:

- palavras em `-ao`/`-oes` com til; cedilha em `serviço`, `licença`; proparoxítonas acentuadas;
- crase em `à`/`às`; nomes próprios com o acento original;
- identificadores, nomes de arquivo e chaves JSON **sem** acento.
