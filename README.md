# Flow OS · Bazuca

A versão gratuita do harness da Flowgrammers para o [Claude Code](https://docs.claude.com/en/docs/claude-code/setup).

O Claude Code é um assistente de IA que trabalha dentro da pasta do seu projeto. Sozinho, ele escreve código bem, mas
não sabe **como você trabalha**: quando planejar, quando testar, o que mostrar ao cliente, o que nunca fazer. Um
**harness** é o conjunto de regras, roteiros e travas que ensina isso a ele, em toda sessão, sem você repetir.

O Bazuca é o modo mais simples do nosso método: **num tiro**, para projetos de pequeno e médio porte. Um pedido entra,
vira requisito verificado, vira plano, vira código testado e revisado, e sai para o cliente com evidência.

## O que vem dentro

| Peça | O que é | No Bazuca |
|---|---|---|
| **Comandos** | Atalhos com barra que seguem um roteiro | 10 |
| **Skills** | Manuais que o assistente consulta sozinho quando o assunto aparece | 7 |
| **Agentes** | Especialistas chamados para uma parte do trabalho | 5 |
| **Regras** | O que vale em toda sessão: segurança, testes, revisão, português | 10 |
| **Hooks** | Travas que rodam sozinhas antes ou depois de cada ação | 4 |

## Instalar (uns 10 minutos)

Antes: [Claude Code](https://docs.claude.com/en/docs/claude-code/setup) com login, [Git](https://git-scm.com/downloads)
e [Node.js](https://nodejs.org/pt/download) 20 ou mais novo.

Dentro do Claude Code, um comando de cada vez:

```
/plugin marketplace add flowgrammers/flow-os-harness-alunos
```

```
/plugin install flow-os-bazuca@flowgrammers-alunos
```

Feche e abra o Claude Code. Depois, uma vez só:

```
/flow-os-bazuca:preparar-maquina
```

Ele grava o seu `CLAUDE.md` global e liga as regras do pacote em toda sessão. Se você já tiver um `CLAUDE.md`, ele
mostra a diferença e só troca com o seu ok. Para conferir, abra uma sessão nova e rode `/context`.

## Como usar: um pedido do começo ao fim

| Etapa | O que você faz | Comando |
|---|---|---|
| 1. Chegou um pedido | Cole a mensagem do cliente (WhatsApp, e-mail, ata) | `/fm-classify` |
| 2. Registrar | Cada item vira requisito com data e origem | `/fm-requirement-register` |
| 3. Verificar | Nota de 0 a 50 em cinco dimensões antes de fazer | `/verify-requirement` |
| 4. Validar com o cliente | Um HTML onde o cliente decide item a item | `/fm-validation-doc` |
| 5. Planejar | Passos, riscos e o que pode dar errado | `/plan` |
| 6. Construir | Teste primeiro, depois o código | `/tdd` |
| 7. Revisar | Um revisor que não foi quem escreveu | `/code-review` |
| 8. Entregar | Um HTML com o pedido, o que foi feito, como foi testado e o aceite | `/fm-delivery-doc` |
| 9. Parar no meio | Guardar onde parou para a próxima sessão continuar | `/handoff-sessao` |

Você não precisa decorar. Pode pedir em português ("organize esta conversa em requisitos") e o assistente escolhe o
roteiro.

## As travas que já vêm ligadas

- Não deixa gravar senha, token ou chave em arquivo.
- Bloqueia comando destrutivo (apagar pasta inteira, forçar envio por cima do trabalho dos outros).
- Avisa quando um texto em português sai sem acento.
- O teste vem antes do código, e a entrega ao cliente só sai com evidência de teste.

## Quatro regras

1. **Você continua responsável.** O assistente é rápido, mas pode errar. Leia antes de enviar ao cliente.
2. **Pessoa aprova, IA propõe.** Decisão de cliente e publicação passam por uma pessoa.
3. **Senha fica fora da conversa.** Token, senha e dado sensível de cliente vão no terminal, nunca no chat.
4. **Bug comunica, não pede aprovação.** Requisito novo ou mudança de comportamento vai para decisão do cliente.

## E depois do Bazuca?

O Bazuca é um recorte do sistema que usamos no dia a dia. A versão completa, **Flow OS · Pro**, traz o modo
Enterprise (várias fontes de escopo, contrato e atas conferidos entre si), o método de coordenação de várias sessões
em paralelo, evals completos e o pipeline inteiro de requisitos. Para conversar sobre ela, chame a Flowgrammers no
LinkedIn.

## Atualizar

```
/plugin marketplace update flowgrammers-alunos
```
