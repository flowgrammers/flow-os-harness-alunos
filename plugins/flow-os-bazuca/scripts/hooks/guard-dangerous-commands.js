#!/usr/bin/env node
/**
 * Hook PreToolUse → Bash
 * Bloqueia comandos destrutivos ou de exfiltração.
 * Exit 2 = BLOCK, Exit 0 = ALLOW
 */

const DANGEROUS_PATTERNS = [
  // Destrutivos
  { name: 'rm -rf /', pattern: /rm\s+(-[a-zA-Z]*f[a-zA-Z]*\s+)?\/\s*$|rm\s+-rf\s+\//, reason: 'Comando destrutivo no root' },
  { name: 'mkfs', pattern: /mkfs\s/, reason: 'Formatação de disco' },
  { name: 'dd of=/dev/', pattern: /dd\s.*of=\/dev\//, reason: 'Escrita direta em device' },

  // Exfiltração
  { name: 'curl exfil secret', pattern: /curl\s.*-[dX].*\$\{?\w*(KEY|SECRET|TOKEN|PASSWORD)\w*\}?/i, reason: 'Exfiltração de secret via curl' },
  { name: 'wget pipe shell', pattern: /wget\s.*\|\s*(ba)?sh/, reason: 'Download e execução remota' },
  { name: 'curl pipe shell', pattern: /curl\s.*\|\s*(ba)?sh/, reason: 'Download e execução remota' },
  { name: 'curl pipe python', pattern: /curl\s.*\|\s*python/, reason: 'Download e execução remota' },

  // Docker destrutivo
  { name: 'docker system prune -a', pattern: /docker\s+system\s+prune\s+-a/, reason: 'Remove todas as imagens Docker' },
  { name: 'docker rm all', pattern: /docker\s+rm.*\$\(docker\s+ps/, reason: 'Remove todos os containers' },

  // Git destrutivo
  { name: 'git push --force main', pattern: /git\s+push\s+.*--force.*\s+(main|master)\b/, reason: 'Force push para branch principal' },
  { name: 'git reset --hard origin', pattern: /git\s+reset\s+--hard\s+origin/, reason: 'Reset destrutivo ao remote' },

  // Database destrutivo
  { name: 'DROP TABLE/DATABASE', pattern: /DROP\s+(TABLE|DATABASE|SCHEMA)\s/i, reason: 'Comando SQL destrutivo' },
  { name: 'DELETE sem WHERE', pattern: /DELETE\s+FROM\s+\w+\s*;/i, reason: 'DELETE sem WHERE clause' },

  // Exfiltração DNS
  { name: 'exfiltração DNS', pattern: /burpcollaborator|\.oastify\.com|\.interact\.sh/i, reason: 'Exfiltração via DNS' },
  { name: 'túnel reverso', pattern: /ngrok\s|localtunnel|serveo\.net/i, reason: 'Túnel reverso expõe serviço' },

  // Permissões
  { name: 'chmod 777', pattern: /chmod\s+777/, reason: 'Permissões excessivamente abertas' },

  // Mining
  { name: 'crypto miner', pattern: /xmrig|minerd|cpuminer|stratum\+tcp/i, reason: 'Possível crypto miner' },
]

function main() {
  let input = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (chunk) => { input += chunk })
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input)
      const command = data.tool_input?.command || ''

      if (!command.trim()) {
        process.stdout.write(input)
        return process.exit(0)
      }

      const found = []
      for (const { name, pattern, reason } of DANGEROUS_PATTERNS) {
        if (pattern.test(command)) {
          found.push({ name, reason })
        }
      }

      if (found.length > 0) {
        process.stderr.write(`[guard-commands] BLOCKED: Comando perigoso detectado:\n`)
        for (const { name, reason } of found) {
          process.stderr.write(`  ${name}: ${reason}\n`)
        }
        process.stderr.write(`  Comando: ${command.slice(0, 200)}\n`)
        process.stderr.write(`  Se necessario, peca confirmacao ao usuario.\n`)
        return process.exit(2)
      }

      process.stdout.write(input)
      process.exit(0)
    } catch {
      process.stdout.write(input || '')
      process.exit(0)
    }
  })
}

main()
