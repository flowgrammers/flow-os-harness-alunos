#!/usr/bin/env node
// exportar-flowos-lib.js — SessionStart do pacote (REQ-514): ED OS e completo.
//
// Exporta FLOWOS_LIB=<raiz do pacote>/scripts/lib para os comandos da sessão, pelo CLAUDE_ENV_FILE que o
// Claude Code entrega ao SessionStart. A pasta do pacote muda a cada versão, então o projeto não consegue
// fixar esse caminho: quem procura uma lib do pacote (o espelho-cliente.js do cmmi-enxuto, o teste-linux.js
// da ci-hygiene) lê $FLOWOS_LIB. Sem CLAUDE_ENV_FILE, sai em silêncio: nunca bloqueia a sessão.
// Também reescreve a ponte das rules do /preparar-maquina quando a versão do pacote muda.
"use strict"

const fs = require("fs")
const path = require("path")

const LINHA_EXPORT = /^export FLOWOS_LIB=.*$/m

/** Raiz do pacote: a variável do Claude Code ou, sem ela, dois níveis acima deste arquivo. */
function raizDoPacote(env = process.env) {
  return env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, "..", "..")
}

/** Linha de export com o caminho em barras normais (o Bash do Windows não lê a contrabarra). */
function linhaDeExport(raiz) {
  const lib = path.join(raiz, "scripts", "lib").split(path.sep).join("/")
  return `export FLOWOS_LIB="${lib.replace(/(["\\$`])/g, "\\$1")}"`
}

/** Grava no arquivo de ambiente sem duplicar: uma linha antiga de FLOWOS_LIB é trocada. */
function exportar(env = process.env) {
  const arquivo = env.CLAUDE_ENV_FILE
  if (!arquivo) return { gravado: false, motivo: "CLAUDE_ENV_FILE ausente" }
  const linha = linhaDeExport(raizDoPacote(env))
  const atual = fs.existsSync(arquivo) ? fs.readFileSync(arquivo, "utf8") : ""
  const novo = LINHA_EXPORT.test(atual)
    ? atual.replace(LINHA_EXPORT, () => linha)
    : `${atual}${atual && !atual.endsWith("\n") ? "\n" : ""}${linha}\n`
  fs.writeFileSync(arquivo, novo)
  return { gravado: true, arquivo, linha }
}

if (require.main === module) {
  try {
    exportar()
  } catch {
    // Falha aqui não pode travar a sessão; sem a variável, o projeto cai no próprio fallback.
  }
  try {
    // A ponte das rules aponta para a pasta da versão; numa máquina preparada, ela acompanha a versão nova.
    require(path.join(__dirname, "..", "lib", "preparar-maquina.js")).atualizarPonte()
  } catch {
    // Idem: a ponte velha só deixa de importar até o próximo /preparar-maquina.
  }
  process.exit(0)
}

module.exports = { exportar, linhaDeExport, raizDoPacote }
