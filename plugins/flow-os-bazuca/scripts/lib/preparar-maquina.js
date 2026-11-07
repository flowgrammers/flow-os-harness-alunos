#!/usr/bin/env node
/**
 * preparar-maquina.js — o CLAUDE.md global da ED e a ponte para as rules do pacote (REQ-514).
 *
 * O Claude Code não carrega `rules/` de plugin. Este script grava, na pasta de configuração do Claude
 * (`$CLAUDE_CONFIG_DIR` ou `~/.claude`):
 *   - `CLAUDE.md`: mínimo da ED (pt-BR com acentuação, papel de PM) que importa a ponte;
 *   - `ed-os-harness/regras.md`: a ponte, com um `@` por rule do pacote, em caminho relativo à ponte.
 * A pasta do pacote muda a cada versão; por isso o CLAUDE.md nunca cita a pasta do pacote, só a ponte, e a
 * ponte é reescrita a cada sessão pelo hook de SessionStart (`ponte`) quando a versão muda.
 *
 * Um CLAUDE.md que já existe e é diferente não é sobrescrito sem `--confirmado`; `plano` mostra o diff.
 * A cópia anterior fica em `CLAUDE.md.antes-do-ed-os` (a segunda ganha sufixo com a data). Um CLAUDE.md gravado por
 * este script (com a MARCA) é atualizado sem confirmação, para a versão nova do texto chegar.
 *
 * Uso:
 *   node preparar-maquina.js plano                 # mostra o que gravaria e o diff, não escreve
 *   node preparar-maquina.js gravar [--confirmado] # grava; recusa (exit 3) se o CLAUDE.md diferente existe
 *   node preparar-maquina.js ponte                 # só reescreve a ponte, se ela já existe
 */
"use strict"

const fs = require("fs")
const os = require("os")
const path = require("path")

const PACOTE_ED = "ed-os-harness"
const PONTE_REL = `${PACOTE_ED}/regras.md`
const MARCA = `<!-- ${PACOTE_ED}: preparar-maquina -->`
const BACKUP = "CLAUDE.md.antes-do-ed-os"

/**
 * O mesmo script serve aos dois pacotes: o nome sai do plugin.json do pacote. Sem plugin.json, vale o ED OS.
 * O texto do ED OS fica como sempre foi; o outro pacote recebe um CLAUDE.md genérico, sem papel nem empresa.
 */
function pacoteDe(raiz) {
  let nome = PACOTE_ED
  try {
    nome = JSON.parse(fs.readFileSync(path.join(raiz, ".claude-plugin", "plugin.json"), "utf8")).name || PACOTE_ED
  } catch {
    // sem plugin.json legível: ED OS
  }
  const ed = nome === PACOTE_ED
  return {
    nome,
    ed,
    ponteRel: `${nome}/regras.md`,
    marca: `<!-- ${nome}: preparar-maquina -->`,
    backup: ed ? BACKUP : `CLAUDE.md.antes-do-${nome}`,
    titulo: ed ? "ED OS · Harness" : `pacote ${nome}`,
  }
}

const posix = (p) => p.split(path.sep).join("/")

function pastaDeConfiguracao(env = process.env) {
  return env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude")
}

function raizDoPacote(env = process.env) {
  return env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, "..", "..")
}

/** Rules do pacote, em ordem estável: `common/` primeiro, depois o resto. README fica de fora. */
function rulesDoPacote(raiz) {
  const base = path.join(raiz, "rules")
  const achadas = []
  const andar = (rel) => {
    for (const e of fs.readdirSync(path.join(base, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name
      if (e.isDirectory()) andar(r)
      else if (e.name.endsWith(".md") && e.name !== "README.md") achadas.push(r)
    }
  }
  if (fs.existsSync(base)) andar("")
  return achadas.sort((a, b) => (a.startsWith("common/") === b.startsWith("common/") ? a.localeCompare(b) : a.startsWith("common/") ? -1 : 1))
}

function textoDaPonte(raiz, config, pac = pacoteDe(raiz)) {
  const dirPonte = path.dirname(path.join(config, pac.ponteRel))
  const imports = rulesDoPacote(raiz).map((r) => `@${posix(path.relative(dirPonte, path.join(raiz, "rules", r)))}`)
  return [
    `# Regras do ${pac.titulo}`,
    "",
    `Gerado pelo /${pac.nome}:preparar-maquina e reescrito a cada sessão pelo hook do pacote, porque a pasta`,
    "do pacote muda a cada versão. Não edite: a próxima sessão desfaz.",
    "",
    ...imports,
    "",
  ].join("\n")
}

function textoDoClaudeMd(pac = pacoteDe(raizDoPacote())) {
  const cabeca = pac.ed
    ? ["# CLAUDE.md — ED", "", MARCA, "", "## Identidade", "", "Product Manager de produtos de IA e LLM na ED. Responda em português do Brasil.", ""]
    : ["# CLAUDE.md", "", pac.marca, "", "## Identidade", "", "Responda em português do Brasil.", ""]
  return [
    ...cabeca,
    "**Acentuação pt-BR obrigatória**: todo texto em português sai com acento — prosa, documento, mensagem de",
    "commit, comentário e texto de interface. Termos que mais erram: gestão, não, também, ação, função, execução,",
    "configuração, sessão, operação, atualização, integração, autenticação, implementação, serviço, técnico,",
    "único, público, automático, padrão. Nome de arquivo, identificador de código e chave de JSON ficam em ASCII.",
    "",
    "## Como trabalhar",
    "",
    "- Planeje antes de executar tarefa de três passos ou mais; se algo der errado, pare e replaneje.",
    "- Nunca marque uma tarefa como concluída sem provar que funciona.",
    "- A mudança mais simples que resolve, na causa, tocando só o necessário.",
    "",
    pac.ed ? "## Regras do ED OS · Harness" : "## Regras do pacote",
    "",
    "As regras do pacote entram pela ponte abaixo, que o pacote mantém em dia a cada versão.",
    "",
    `@${pac.ponteRel}`,
    "",
  ].join("\n")
}

/** Diff de linhas pela maior subsequência comum: `-` sai, `+` entra, ` ` fica. */
function diffDeLinhas(antes, depois) {
  const a = antes.replace(/\r\n/g, "\n").split("\n")
  const b = depois.split("\n")
  const m = a.map(() => new Array(b.length + 1).fill(0))
  m.push(new Array(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) m[i][j] = a[i] === b[j] ? m[i + 1][j + 1] + 1 : Math.max(m[i + 1][j], m[i][j + 1])
  const out = []
  let i = 0
  let j = 0
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) out.push(`  ${a[i++]}`), j++
    else if (j < b.length && (i === a.length || m[i][j + 1] >= m[i + 1][j])) out.push(`+ ${b[j++]}`)
    else out.push(`- ${a[i++]}`)
  }
  return out.join("\n")
}

function planejar(env = process.env) {
  const config = pastaDeConfiguracao(env)
  const raiz = raizDoPacote(env)
  const pac = pacoteDe(raiz)
  const arquivo = path.join(config, "CLAUDE.md")
  const novo = textoDoClaudeMd(pac)
  const atual = fs.existsSync(arquivo) ? fs.readFileSync(arquivo, "utf8") : null
  const normal = atual === null ? null : atual.replace(/^﻿/, "").replace(/\r\n/g, "\n")
  // O que este script gravou (tem a MARCA) é atualizado sem pedir confirmação nem backup: não é conteúdo da pessoa.
  const estado = atual === null ? "novo" : normal === novo ? "igual" : normal.includes(pac.marca) ? "nosso" : "diferente"
  return {
    config,
    raiz,
    pacote: pac,
    arquivo,
    novo,
    atual,
    estado,
    ponte: { arquivo: path.join(config, pac.ponteRel), texto: textoDaPonte(raiz, config, pac), rules: rulesDoPacote(raiz).length },
  }
}

function gravarPonte(p) {
  fs.mkdirSync(path.dirname(p.ponte.arquivo), { recursive: true })
  const atual = fs.existsSync(p.ponte.arquivo) ? fs.readFileSync(p.ponte.arquivo, "utf8") : null
  if (atual !== p.ponte.texto) fs.writeFileSync(p.ponte.arquivo, p.ponte.texto)
  return atual !== p.ponte.texto
}

function gravar({ confirmado = false, env = process.env } = {}) {
  const p = planejar(env)
  if (p.estado === "diferente" && !confirmado) return { ok: false, codigo: 3, plano: p }
  gravarPonte(p)
  let backup = null
  if (p.estado === "diferente") {
    // Backup anterior nunca é sobrescrito: a segunda confirmação ganha sufixo com a data.
    backup = path.join(p.config, p.pacote.backup)
    if (fs.existsSync(backup)) backup = `${backup}.${new Date().toISOString().replace(/[:.]/g, "-")}`
    fs.copyFileSync(p.arquivo, backup)
  }
  if (p.estado !== "igual") fs.writeFileSync(p.arquivo, p.novo)
  return { ok: true, codigo: 0, plano: p, backup }
}

/** Reescreve a ponte se ela existe (máquina já preparada); senão não cria nada. */
function atualizarPonte(env = process.env) {
  const p = planejar(env)
  if (!fs.existsSync(p.ponte.arquivo)) return { atualizada: false, motivo: "máquina não preparada" }
  return { atualizada: gravarPonte(p) }
}

function imprimirPlano(p) {
  console.log(`pasta de configuração: ${p.config}`)
  console.log(`pacote: ${p.raiz} (${p.ponte.rules} rules)`)
  console.log(`ponte: ${p.ponte.arquivo}`)
  console.log(`cópia de segurança, se o CLAUDE.md for trocado: ${path.join(p.config, p.pacote.backup)}`)
  console.log(`CLAUDE.md: ${p.arquivo} — ${p.estado}`)
  if (/\n@(?:[A-Za-z]:)?\//.test(p.ponte.texto)) console.log("aviso: o pacote está em outro disco que a configuração; a ponte usa caminho absoluto")
  if (p.estado === "diferente") console.log(`\ndiff (- sai, + entra):\n${diffDeLinhas(p.atual, p.novo)}`)
  else if (p.estado === "novo") console.log(`\nconteúdo:\n${p.novo}`)
}

function main(argv = process.argv.slice(2)) {
  const [acao] = argv
  if (acao === "plano") {
    imprimirPlano(planejar())
    return 0
  }
  if (acao === "gravar") {
    const r = gravar({ confirmado: argv.includes("--confirmado") })
    if (!r.ok) {
      imprimirPlano(r.plano)
      console.log("\nrecusado: o CLAUDE.md existente é diferente. Mostre o diff e, com o ok, rode com --confirmado.")
      return r.codigo
    }
    console.log(`gravado: ${r.plano.arquivo} (${r.plano.estado === "igual" ? "já estava em dia" : r.plano.estado}) e ${r.plano.ponte.arquivo} (${r.plano.ponte.rules} rules)`)
    if (r.backup) console.log(`cópia anterior: ${r.backup}`)
    return 0
  }
  if (acao === "ponte") {
    console.log(JSON.stringify(atualizarPonte()))
    return 0
  }
  console.error("uso: preparar-maquina.js plano | gravar [--confirmado] | ponte")
  return 2
}

if (require.main === module) process.exit(main())

module.exports = { pacoteDe, planejar, gravar, atualizarPonte, textoDaPonte, textoDoClaudeMd, diffDeLinhas, rulesDoPacote, PONTE_REL, MARCA }
