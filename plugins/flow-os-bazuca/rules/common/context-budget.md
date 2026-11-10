# Orçamento de Contexto — quando parar de acumular e começar a entregar

## Princípio

Sessão longa não termina porque o trabalho acabou. Termina porque o contexto acabou — e a
diferença entre as duas coisas é quem decidiu. **Quando a decisão é do limite, o que estava na
cabeça da sessão se perde**, e a próxima recomeça reconstruindo contexto em vez de trabalhando.

O objetivo desta regra é simples: **atravessar a fronteira de sessão sem perder o fio**.

## As três faixas

| Ocupação | Faixa | O que muda |
|---|---|---|
| até ~65% | **normal** | Trabalho como sempre: investigar, refatorar, abrir frentes |
| 65% a 90% | **handoff** | **Começar a montar** o handoff, em paralelo ao trabalho. Escolher tarefas **menores** |
| acima de 90% | **concluir** | Terminar o que está aberto e completar o handoff. Não abrir nada novo |

Concluir **entre 80% e 90%** é o alvo. Passar de 90% é falha de planejamento, não heroísmo: o
risco de perder o trabalho não registrado cresce mais rápido do que o que ainda se produz.

> ## Isto avisa. Não interrompe.
>
> As faixas são **conselho**, nunca freio. Nenhum mecanismo aqui aborta chamada, bloqueia
> ferramenta ou encerra sessão — quem decide como fechar é o agente, que é o único que sabe o que
> está no meio. **Parar no meio de uma tarefa perderia exatamente o trabalho que o handoff existe
> para preservar.**
>
> Consequência prática para quem for implementar o aviso: ele vai em `PostToolUse`, não em
> `PreToolUse`. Em `PreToolUse`, `exit 2` **bloqueia a chamada** — seria interrupção. Em
> `PostToolUse`, `exit 2` entrega a mensagem ao modelo com a ferramenta já executada: o agente
> lê e decide, nada é impedido.

## O que fazer ao cruzar 65%

### 1. COMEÇAR o documento de handoff — e ir completando

A palavra é *começar*. Crie o arquivo assim que cruzar o limiar, ainda incompleto, e vá
preenchendo conforme o trabalho avança. Deixar para escrever no fim é apostar que vai haver fim:
o contexto pode acabar antes, e aí não sobra nem o documento.

Na prática: ao cruzar 65%, escreva o esqueleto com o que já se sabe (onde parei, decisões
tomadas). Ao terminar cada tarefa daí em diante, atualize a linha correspondente. Aos 90%, o
documento já está quase pronto e só falta fechar.

Ele contém **todo e apenas** o necessário para outra sessão continuar de onde esta parou:

- **A tarefa em andamento** e em que passo exatamente ela está
- **As decisões já tomadas** nesta sessão — para não serem rediscutidas
- **Os arquivos tocados** e o que falta em cada um
- **O comando de verificação** que diz se o estado ainda é o mesmo
- **O que não funcionou** — para a próxima sessão não repetir a tentativa

O que **não** entra: histórico narrativo do que foi feito, transcrição de raciocínio, ou contexto
que a próxima sessão consegue reler sozinha. Handoff não é diário de bordo. A régua prática:
*a próxima sessão consegue retomar sem abrir o transcript desta?*

### 2. Atualizar os documentos de acompanhamento

Quais, depende do projeto. Se o `CLAUDE.md` do projeto declarar um bloco `handoff-docs`, use a
lista dele. Sem o bloco, o hook `flowos-papel.js` cai num padrão herdado do projeto de origem
(`TRACKING.md`, `docs/RETOMADA.md`) — **um palpite deste projeto, não uma convenção fleet-wide**: em
projeto onde esses arquivos não existem (ex.: um projeto que use outro documento de acompanhamento), a proteção não tem objeto.
Declare o bloco assim que o projeto tiver documento de acompanhamento próprio; não conte com o
fallback (medido em 2026-09-25, REQ-361/D9).

**A auto-memory fica de fora do automático.** Memória é curadoria: o que merece virar permanente é
decisão de quem lê, não subproduto de um limiar.

### 3. Mudar o tipo de tarefa

Depois do limiar, prefira o que **consome pouco e fecha**:

| Prefira | Evite |
|---|---|
| Terminar arquivo já aberto | Abrir frente nova |
| Rodar o gate e corrigir o que ele apontar | Investigação exploratória ampla |
| Escrever documentação do que já foi decidido | Refatoração de escopo aberto |
| Commitar trabalho verificado | Varredura de codebase |

## Como medir a ocupação

**Ocupação não é a soma da sessão.** Somar `input + output` de todas as mensagens mede *vazão* —
quanto se gastou no total —, não quanto está na janela agora. Os dois divergem cada vez mais a cada
turno.

A ocupação é o **lado da entrada da última chamada**:

```
input_tokens + cache_read_input_tokens + cache_creation_input_tokens
```

E o denominador é a janela **daquele modelo** — não uma constante.

> **O erro que originou esta regra**: o harness media contexto somando a sessão inteira e dividindo
> por 200.000 fixo, com `Math.min(100, ...)` por cima. Resultado medido em 1.000 amostras: **63,4%
> ficaram travadas em 100%**, e o total chegou a 897.064 tokens. O teto escondeu o defeito por
> meses. **Percentual acima de 100% é informação — significa que a janela configurada está errada.
> Nunca trunque.**

## Regras inegociáveis

1. **Não deixe a sessão morrer sem handoff.** Se cruzou 65%, o handoff vem antes da próxima tarefa.
2. **Handoff é para continuar, não para relatar.** Contexto que não ajuda a retomar é ruído.
3. **Nunca truncar percentual de ocupação.** Passar de 100% é o sintoma de janela errada.
4. **Janela desconhecida ⇒ use valor absoluto, e avise.** Melhor um limiar em tokens do que um
   percentual inventado — e nunca o silêncio: modelo fora da tabela avisa a partir de 130.000 tokens
   e de novo a cada 100.000, pedindo para incluir o modelo em `context-window.js` (REQ-448: uma
   sessão chegou a 97% sem aviso porque o modelo novo não estava na tabela).
5. **Auto-memory não entra no automático.** A máquina propõe; o humano decide o que fica.
