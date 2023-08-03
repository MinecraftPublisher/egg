const ts = require('typescript')
const fs = require('fs')

const funcs: ({ refs: string[], text: string })[] = []
const recursive = ((path = './mod/') => {
    const files: string[] = fs.readdirSync(path)
    for (let file of files) {
        let stats = fs.lstatSync(path + file)
        if (stats.isDirectory()) {
            recursive(path + file + '/')
        } else {
            if (file.endsWith('.d.ts')) continue
            if (!file.endsWith('.ts')) continue
            console.log('-> ' + path.substring('./mod/'.length) + file)
            const text: string = fs.readFileSync(path + file, 'utf-8')
            const refs = text.match(/\/\/:[a-z0-9_]+/gi) ?? []

            funcs.push({
                refs,
                text
            })
        }
    }
})

console.log('loading modules...')
recursive()
const egg = fs.readFileSync('egg.ts', 'utf-8')
const built = egg
    .replace('//__HANDLER__', `${funcs.map(e => e.text).join('\n\n')}`)
    .replace('let internals: (() => returnAction)[] = [] //__BUILD__', `let internals = { ${funcs.map(e => e.refs)
    .flat().map(e => `"${e.substring(3)}": ${e.substring(3)}`).join(',\n')} }`)
    .replace('let cases: string[] = [] //__BUILD__', `let cases = ${JSON.stringify(funcs.map(e => e.refs)
        .flat().map(e => e.substring(3)))}`)

const program = ts.transpileModule(built, {
    fileName: 'egg.js',
    moduleName: 'egg',
    compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: 'Node16'
    }
})

fs.writeFileSync('dist/egg.ts', built)
fs.writeFileSync('dist/egg.js', `//@ts-nocheck
/**
 * Egg flow interpreter
 * By github/MinectaftPublisher
 */
${program.outputText}`)