const ts = require('typescript')
const fs = require('fs')

const chalk = require('chalk').Chalk

const __build_Factory = ((LOG = false) => {
    const funcs: ({ refs: { name: string, ref: string }[], text: string })[] = []
    const recursive = ((path = './mod/') => {
        const files: string[] = fs.readdirSync(path)
        for (let file of files) {
            let stats = fs.lstatSync(path + file)
            if (stats.isDirectory()) {
                recursive(path + file + '/')
            } else {
                if (file.endsWith('.d.ts')) continue
                if (!file.endsWith('.ts')) continue
                if(LOG) console.log('-> ' + path.substring('./mod/'.length) + file)
                const text: string = fs.readFileSync(path + file, 'utf-8')
                let refs = text.match(/\/\/:.+/gi) ?? []

                let ref2 = refs.map(e => e.substring(3))
                    .map(e => {
                        if (e.split(' -> ').length === 2) {
                            return {
                                name: e.split(' -> ')[0],
                                ref: e.split(' -> ')[1]
                            }
                        } else {
                            return {
                                name: e,
                                ref: e
                            }
                        }
                    })

                funcs.push({
                    refs: ref2,
                    text: text.replaceAll(/\n+export {[^}]+}/g, '')
                })
            }
        }
    })

    if(LOG) console.log('loading modules...')
    recursive()
    const egg = fs.readFileSync('egg.ts', 'utf-8')
    const built = egg
        .replace('//__HANDLER__', `${funcs.map(e => e.text).join('\n\n')}`)
        .replace('let internals: { [key: string]: (() => returnAction) } = {} //__BUILD__', `let internals = {\n${funcs.map(e => e.refs)
            .flat().map(e => `"${e.name}": ${e.ref}`).join(',\n')}\n}`)
        .replace(`const loggers = {} //__BUILD__`, `const loggers = { ${funcs.map(e => e.refs).flat().map(e => `${JSON.stringify(e.name)}: __debug(${JSON.stringify(e.name)})`).join(', ')} }`)
        .replaceAll(/\/\/\/ .+/g, (e) => `debug(${e.substring(4)})`)

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
 * By github/MinecraftPublisher
 */
${program.outputText}`)
})

if(!fs.existsSync('dist/')) fs.mkdirSync('dist/')
if(process.argv.includes('build__console')) __build_Factory(true)

export default __build_Factory;