//:branch
const branch = (async (): Promise<returnAction> => {
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