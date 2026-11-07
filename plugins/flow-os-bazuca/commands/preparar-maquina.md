---
description: Prepara a máquina para o pacote — grava o CLAUDE.md global (pt-BR com acentuação) e a ponte que carrega as regras do pacote em toda sessão. Rode uma vez, depois de instalar o pacote; se já existir um CLAUDE.md diferente, mostra o diff e só troca com a sua confirmação.
---

# /preparar-maquina — CLAUDE.md global e as regras do pacote

O Claude Code não carrega a pasta `rules/` de um plugin. Este comando grava dois arquivos na pasta de
configuração do Claude (`$CLAUDE_CONFIG_DIR`, ou `~/.claude` quando ela não está definida):

- `CLAUDE.md`: o mínimo do pacote, que importa a ponte;
- `<nome do pacote>/regras.md`: a ponte, um `@` por regra do pacote.

A pasta do pacote muda a cada versão. Por isso o `CLAUDE.md` cita só a ponte, e o hook de SessionStart do
pacote reescreve a ponte quando a versão muda. Ninguém precisa editar caminho à mão.

Rode pela ferramenta **Bash**, com o caminho entre aspas. O estado do shell não persiste entre chamadas: cada comando
abaixo traz o caminho inteiro.

## Passos

1. **Ver o plano** (só lê): `node "${CLAUDE_PLUGIN_ROOT}/scripts/lib/preparar-maquina.js" plano`. A saída diz a pasta, a ponte, a cópia de segurança,
   quantas regras o pacote tem e o estado do `CLAUDE.md`: `novo`, `igual`, `nosso` (gravado por este comando numa
   versão anterior) ou `diferente`.
2. **Estado `novo`, `igual` ou `nosso`**: grave com `node "${CLAUDE_PLUGIN_ROOT}/scripts/lib/preparar-maquina.js" gravar`.
3. **Estado `diferente`**: mostre o diff inteiro ao usuário, como saiu, e diga que a cópia atual fica na
   cópia de segurança que o plano mostrou. Pergunte se pode substituir. Sem resposta afirmativa, pare sem gravar. Com o ok:
   `node "${CLAUDE_PLUGIN_ROOT}/scripts/lib/preparar-maquina.js" gravar --confirmado`. Sem `--confirmado`, o script
   recusa (saída 3) e não escreve nada.
4. **Conferir**: peça ao usuário para abrir uma sessão nova e rodar `/context`. As regras do pacote aparecem na
   memória carregada, vindas da ponte que o plano mostrou. Na sessão atual elas ainda não aparecem: o
   `CLAUDE.md` é lido no início da sessão.
