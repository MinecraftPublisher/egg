type Iregistry = { [key: string]: number }
type InumberMemory = { [key: string]: number }
type IstringMemory = { [key: string]: string }

interface IeggReturn {
    stackTrace: { n: number, program: string }[]
    registry: Iregistry
    num_memory: InumberMemory
    str_memory: IstringMemory
}

type eggReturn = Promise<IeggReturn>

const sgn = ((x) => x > 0 ? 1 : x < 0 ? -1 : 0)

const DEBUG = false

const __MODULE_STORAGE: { [key: string]: any } = {}

const __debug = require('debug')
const log = __debug('egg')
const loggers = {} //__BUILD__
const _ = loggers

const debug = ((...g) => {
    log(...g)
})

enum returnAction {
    PEACEFUL = 0,
    CONTINUE = 1,
    EXIT = 2,
    CRITICAL = 3
}

const egg = (async (text: string, filename: string, registry: Iregistry = {}, num_memory: InumberMemory = {}, str_memory: IstringMemory = {}): Promise<IeggReturn> => {
    const stack: number[] = []
    const trace: { n: number, program: string }[] = []

    stack.push(0)
    let lines = text.split('\n')
    const longest = lines.filter(e => e.startsWith('str::') || e.startsWith('num::') || e.startsWith('int::')).length > 0 ? lines
        .filter(e => e.startsWith('str::') || e.startsWith('num::') || e.startsWith('int::'))
        .sort((a, b) => sgn(b.split(' ')[0].length - a.split(' ')[0].length))[0]
        .split(' ')[0].length : 1

    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === '') {
            /// "Continue from empty line", i
            continue
        }
        // if(DEBUG) console.log(i)
        stack[stack.length - 1] = i
        let line = lines[i]
        if (line.startsWith(':')) {
            if (stack.length !== 1) {
                stack.splice(stack.length - 1)
                i = stack[stack.length - 1]

                /// "Continue from stack trace call", i
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

            /// "Continue from segment registry", i
            continue
        }


        trace.push({
            n: i + 1,
            program: filename
        })

        if (line.startsWith('str::')) {
            let name = line.substring(5).split(' ')[0]
            let args = line.substring(name.length + 6)

            str_memory[name] = args

            /// "Continue from string declaration", i
            continue
        }

        if (line.startsWith('num::')) {
            let name = line.substring(5).split(' ')[0]
            let args = parseFloat(line.substring(name.length + 6))

            if (isNaN(args)) {
                console.log('CRITICAL FAILURE: Couldn\'t convert \'' + line.substring(name.length + 6) + '\' to float at line ' + (i + 1) + '!')
                return {
                    stackTrace: [...trace, {
                        n: -1,
                        program: 'CRITICAL'
                    }],
                    registry,
                    num_memory,
                    str_memory
                }
            }
            num_memory[name] = parseFloat(args.toString())
            /// "Continue from integer declaration", i
            continue
        }

        if (line.startsWith('int::')) {
            let name = line.substring(5).split(' ')[0]
            let args = parseFloat(line.substring(name.length + 6))

            if (isNaN(args)) {
                console.log('CRITICAL FAILURE: Couldn\'t convert \'' + line.substring(name.length + 6) + '\' to float at line ' + (i + 1) + '!')
                return {
                    stackTrace: [...trace, {
                        n: -1,
                        program: 'CRITICAL'
                    }],
                    registry,
                    num_memory,
                    str_memory
                }
            }
            num_memory[name] = parseFloat(args.toString())
            /// "Continue from integer declaration", i
            continue
        }

        let command = line.split(' ')[0]
        let args = line.substring(command.length + 1).trim()

        //__HANDLER__

        let internals: { [key: string]: (() => returnAction) } = {} //__BUILD__

        command = command.replaceAll('.', '_')
        let isInternal = !!internals[command]
        if (isInternal) {
            const returnValue = await internals[command]()
            if (returnValue === returnAction.CONTINUE) continue
            else if (returnValue === returnAction.PEACEFUL) { }
            else if (returnValue === returnAction.CRITICAL) {
                throw {
                    stackTrace: [...trace, {
                        n: -1,
                        program: 'CRITICAL'
                    }],
                    registry,
                    num_memory,
                    str_memory
                }
            }
            else if (returnValue === returnAction.EXIT) {
                return {
                    stackTrace: [...trace, {
                        n: -1,
                        program: 'EXIT'
                    }],
                    registry,
                    num_memory,
                    str_memory
                }
            }
        } else {
            console.log('CRITICAL FAILURE: Couldn\'t spot internal function \'' + command + '\' at line ' + (i + 1) + '!')

            return {
                stackTrace: [...trace, {
                    n: -1,
                    program: 'CRITICAL'
                }],
                registry,
                num_memory,
                str_memory
            }
        }
    }
    /// "Loop exit"

    return {
        stackTrace: trace,
        registry,
        num_memory,
        str_memory
    }
})

export default egg;