# Fluxo de Desenvolvimento

> Este arquivo estende [common/git-workflow.md](./git-workflow.md) com o processo completo de desenvolvimento que acontece antes das operacoes git.

O Workflow de Implementacao de Features descreve o pipeline de desenvolvimento: pesquisa, planejamento, TDD, code review e entao commit no git.

## Workflow de Implementacao de Features

0. **Pesquisa e Reuso** _(obrigatorio antes de qualquer nova implementacao)_
   - **grep.app primeiro:** Buscar padroes reais em `https://grep.app/search?q=QUERY&filter[lang][0]=LANG` para ver como projetos reais implementam o pattern. Usar tambem ao curar skills de projeto e ao mudar stack.
   - **Busca no GitHub depois:** Rodar `gh search repos` e `gh search code` para encontrar implementacoes, templates e padroes existentes.
   - **Docs da biblioteca:** Usar Context7 ou docs oficiais do vendor para confirmar comportamento da API, uso do pacote e detalhes especificos de versao antes de implementar.
   - **Exa somente quando os anteriores forem insuficientes:** Usar Exa para pesquisa web mais ampla ou descoberta apos busca no GitHub e docs primarios.
   - **Checar registros de pacotes:** Buscar npm, PyPI, crates.io e outros registros antes de escrever codigo utilitario. Preferir bibliotecas testadas em batalha ao inves de solucoes feitas a mao.
   - **Buscar implementacoes adaptaveis:** Procurar projetos open-source que resolvam 80%+ do problema e possam ser forkados, portados ou wrappados.
   - Preferir adotar ou portar uma abordagem comprovada ao inves de escrever codigo totalmente novo quando atende o requisito.

### grep.app como co-funcao de curadoria

Usar grep.app OBRIGATORIAMENTE nestes momentos:
- **Curadoria de skills** (manual via `scripts/activate-dormant.sh` ou copia direta de `skills/_dormant/`): verificar se padroes da stack tem adocao real
- **Mudanca de stack**: antes de ativar skills dormant, buscar padroes reais da nova tecnologia
- **Nova dependencia**: confirmar que o pattern de uso e o adotado pela comunidade
- **Decisao arquitetural**: comparar abordagens buscando implementacoes reais

URL pattern: `https://grep.app/search?q=QUERY&filter[lang][0]=LANG`
Filtros: `filter[lang]`, `filter[repo]`, `filter[path]`, `regexp=true`

1. **Planejar Primeiro**
   - Usar agente **planner** para criar plano de implementacao
   - Gerar docs de planejamento antes de codar: PRD, arquitetura, design do sistema, doc tecnico, lista de tarefas
   - Identificar dependencias e riscos
   - Quebrar em fases

2. **Abordagem TDD**
   - Usar agente **tdd-guide**
   - Escrever testes primeiro (VERMELHO)
   - Implementar para passar testes (VERDE)
   - Refatorar (MELHORAR)
   - Verificar cobertura 80%+

3. **Code Review**
   - Usar agente **code-reviewer** imediatamente apos escrever codigo
   - Resolver issues CRITICAL e HIGH
   - Corrigir issues MEDIUM quando possivel

4. **Commit e Push**
   - Mensagens de commit detalhadas
   - Seguir formato de conventional commits
   - Ver [git-workflow.md](./git-workflow.md) para formato de mensagem e processo de PR

5. **Checagens Pre-Review**
   - Verificar que todos os checks automatizados (CI/CD) estao passando
   - Resolver quaisquer conflitos de merge
   - Garantir que branch esta atualizada com branch alvo
   - Solicitar review somente apos essas checagens passarem
