const registry = {}

const num_memory = {}
const str_memory = {}

const sgn = ((x) => x > 0 ? 1 : x < 0 ? -1 : 0)

const DEBUG = true

enum returnAction {
    PEACEFUL = 0,
    CONTINUE = 1,
    EXIT = 2,
    CRITICAL = 3
}

const egg = ((text: string): number[] => {
    const stack: number[] = []
    const trace: number[] = []

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
                console.log('CRITICAL FAILURE: Couldn\'t convert \'' + line.substring(name.length + 6) + '\' to float at line ' + (i + 1) + '!')
                return trace
            }
            num_memory[name] = parseFloat(args.toString())
            continue
        }

        let command = line.split(' ')[0]
        let args = line.substring(command.length + 1).trim()

        //:echo
const echo = ((): returnAction => {
    if (DEBUG) {
        let varname = args.split(' ')[0]
        let space = longest - varname.length
        space = space < 0 ? 0 : space
        console.log(`[${varname}]${new Array(space).fill(' ').join('')}| ` + str_memory[varname] ?? num_memory[varname] ?? '(null)')
    } else {
        console.log(str_memory[args.split(' ')[0]] ?? '(null)')
    }

    return returnAction.PEACEFUL
})

//:exit
const exit = ((): returnAction => {
    return returnAction.EXIT
})

//:branch
const branch = ((): returnAction => {
    let addcond = args.split(' ')[0]
    let cond = str_memory[addcond] ?? num_memory[addcond]
    let trueCase = registry[args.split(' ')[1]] ?? (i + 1)
    let falseCase = registry[args.split(' ')[2]] ?? (i + 1)

    if (!addcond) {
        console.log('CRITICAL FAILURE: Condition memory address at line ' + (i + 1) + ' not provided!', args.split(' ')[0])
        return returnAction.CRITICAL
    } else if (!addcond) {
        console.log('CRITICAL FAILURE: True case memory address at line ' + (i + 1) + ' not provided!', args.split(' ')[1])
        return returnAction.CRITICAL
    }

    if (cond === 'true' || !!cond) {
        stack[stack.length - 1] = i
        stack.push(trueCase)
        i = trueCase
        return returnAction.CONTINUE
    } else {
        stack[stack.length - 1] = i
        stack.push(falseCase)
        i = falseCase
        return returnAction.CONTINUE
    }
})

//:goto
const goto = ((): returnAction => {
    if (!registry[args.split(' ')[0]]) {
        console.log('CRITICAL FAILURE: Couldn\'t find segment \'' + args.split(' ')[0] + '\' to run goto at line ' + (i + 1) + '!')
        return returnAction.CRITICAL
    }
    stack[stack.length - 1] = i + 1
    stack.push(registry[args.split(' ')[0]])

    i = registry[args.split(' ')[0]]
    return returnAction.PEACEFUL
})

        let cases = ["echo","exit","branch","goto"]
        let internals = { "echo": echo,
"exit": exit,
"branch": branch,
"goto": goto }

        let isInternal = cases.includes(command)
        if (isInternal) {
            const returnValue = internals[command]()
            if (returnValue === returnAction.CONTINUE) continue
            else if (returnValue === returnAction.PEACEFUL) { }
            else if (returnValue === returnAction.CRITICAL) process.exit(1)
            else if (returnValue === returnAction.EXIT) process.exit(0)
        } else {
            console.log('CRITICAL FAILURE: Couldn\'t spot internal function \'' + command + '\' at line ' + (i + 1) + '!')
        }
    }

    return trace
})

const fs = require('fs')
const file = fs.readFileSync('program.egg', 'utf-8')

let trace = egg(file)
console.log()
console.log('final stack:', trace)

export { };