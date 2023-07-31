const registry = {}

const num_memory = {}
const str_memory = {}

const sgn = ((x) => x > 0 ? 1 : x < 0 ? -1 : 0)

const DEBUG = true

const egg = ((text) => {
    const stack = []
    const trace = []

    stack.push(0)
    let lines = text.split('\n')
    const longest = lines
        .filter(e => e.startsWith('str::'))
        .sort((a, b) => sgn(b.split(' ')[0].length - a.split(' ')[0].length))[0]
        .split(' ')[0].length

    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === '') continue
        // if(DEBUG) console.log(i)
        stack[stack.length - 1] = i
        let line = lines[i]
        if (line.startsWith(':')) {
            if (stack.length !== 1) {
                stack.splice(stack.length - 1)
                i = stack[stack.length - 1]
                continue
            }
            let name = line.substring(1).split(' ')[0]
            registry[name] = i

            if (name !== 'main') {
                i++
                while (!lines[i].startsWith(':main')) {
                    if (lines[i].startsWith(':')) {
                        let name = lines[i].substring(1).split(' ')[0]
                        registry[name] = i
                    }
                    i++
                }
            }
            continue
        }


        trace.push(i + 1)

        if (line.startsWith('str::')) {
            let name = line.substring(5).split(' ')[0]
            let args = line.substring(name.length + 6)

            str_memory[name] = args
            continue
        }

        if (line.startsWith('num::')) {
            let name = line.substring(5).split(' ')[0]
            let args = parseFloat(line.substring(name.length + 6))

            if (isNaN(args)) {
                console.log('CRITICAL FAILURE: Couldn\'t convert \'' + line.substring(name.length + 6) + '\' to float at line ' + (i + 1) + '!', registry)
                return trace
            }
            num_memory[name] = parseFloat(args.toString())
            continue
        }

        let command = line.split(' ')[0]
        let args = line.substring(command.length + 1).trim()

        if (command === 'goto') {
            if (!registry[args.split(' ')[0]]) {
                console.log('CRITICAL FAILURE: Couldn\'t find segment \'' + args.split(' ')[0] + '\' to run goto at line ' + (i + 1) + '!', registry)
                return trace
            }
            stack[stack.length - 1] = i + 1
            stack.push(registry[args.split(' ')[0]])

            i = registry[args.split(' ')[0]]
            continue
        } else if (command === 'echo') {
            if (DEBUG) {
                let varname = args.split(' ')[0]
                let space = longest - varname.length
                space = space < 0 ? 0 : space
                console.log(`[${varname}]${new Array(space).fill(' ').join('')}| ` + str_memory[varname] ?? num_memory[varname] ?? '(null)')
            } else {
                console.log(str_memory[args.split(' ')[0]] ?? '(null)')
            }
        } else if (command === 'branch') {
            let addcond = args.split(' ')[0]
            let cond = str_memory[addcond] ?? num_memory[addcond]
            let trueCase = registry[args.split(' ')[1]] ?? (i + 1)
            let falseCase = registry[args.split(' ')[2]] ?? (i + 1)

            if (!addcond) {
                console.log('CRITICAL FAILURE: Condition memory address at line ' + (i + 1) + ' not provided!', args.split(' ')[0])
                return trace
            } else if (!addcond) {
                console.log('CRITICAL FAILURE: True case memory address at line ' + (i + 1) + ' not provided!', args.split(' ')[1])
                return trace
            }

            if (cond === 'true' || !!cond) {
                stack[stack.length - 1] = i
                stack.push(trueCase)
                i = trueCase
                continue
            } else {
                stack[stack.length - 1] = i
                stack.push(falseCase)
                i = falseCase
                continue
            }
        } else if (command === 'exit') {
            return trace
        }
    }

    return trace
})

const fs = require('fs')
const file = fs.readFileSync('program.egg', 'utf-8')

let trace = egg(file)
console.log()
console.log('final stack:', trace)