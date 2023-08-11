#!/usr/bin/env bun
const target = 'bundle.js'

const node_path = process.argv[0]
const __filename = process.argv[1]
const args = process.argv.slice(2)

await import(__filename.replaceAll('/bin/index.ts', `/bin/${target}`))