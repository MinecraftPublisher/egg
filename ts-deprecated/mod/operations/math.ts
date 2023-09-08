//:add
//:+ -> add
const add = (() => {
    let adr1 = args.split(' ')[0]
    let adr2 = args.split(' ')[1]
    let dest = args.split(' ')[2]

    let num1 = num_memory[adr1]
    let num2 = num_memory[adr2]

    if(!num1) {
        console.log('CRITICAL ERROR: Cannot find integer ' + adr1 + ' in memory at line ' + i + '!')
        return returnAction.CRITICAL
    } else if(!num2) {
        console.log('CRITICAL ERROR: Cannot find integer ' + adr2 + ' in memory at line ' + i + '!')
        return returnAction.CRITICAL
    }

    num_memory[dest] = num1 + num2
    return returnAction.PEACEFUL
})

//:subtract
//:- -> subtract
const subtract = (() => {
    let adr1 = args.split(' ')[0]
    let adr2 = args.split(' ')[1]
    let dest = args.split(' ')[2]

    let num1 = num_memory[adr1]
    let num2 = num_memory[adr2]

    if(!num1) {
        console.log('CRITICAL ERROR: Cannot find integer ' + adr1 + ' in memory at line ' + i + '!')
        return returnAction.CRITICAL
    } else if(!num2) {
        console.log('CRITICAL ERROR: Cannot find integer ' + adr2 + ' in memory at line ' + i + '!')
        return returnAction.CRITICAL
    }

    num_memory[dest] = num1 + num2
    return returnAction.PEACEFUL
})

//:multiply
//:* -> multiply
const multiply = (() => {
    let adr1 = args.split(' ')[0]
    let adr2 = args.split(' ')[1]
    let dest = args.split(' ')[2]

    let num1 = num_memory[adr1]
    let num2 = num_memory[adr2]

    if(!num1) {
        console.log('CRITICAL ERROR: Cannot find integer ' + adr1 + ' in memory at line ' + i + '!')
        return returnAction.CRITICAL
    } else if(!num2) {
        console.log('CRITICAL ERROR: Cannot find integer ' + adr2 + ' in memory at line ' + i + '!')
        return returnAction.CRITICAL
    }

    num_memory[dest] = num1 * num2
    return returnAction.PEACEFUL
})

//:pow
//:** -> pow
const pow = (() => {
    let adr1 = args.split(' ')[0]
    let adr2 = args.split(' ')[1]
    let dest = args.split(' ')[2]

    let num1 = num_memory[adr1]
    let num2 = num_memory[adr2]

    if(!num1) {
        console.log('CRITICAL ERROR: Cannot find integer ' + adr1 + ' in memory at line ' + i + '!')
        return returnAction.CRITICAL
    } else if(!num2) {
        console.log('CRITICAL ERROR: Cannot find integer ' + adr2 + ' in memory at line ' + i + '!')
        return returnAction.CRITICAL
    }

    num_memory[dest] = num1 ** num2
    return returnAction.PEACEFUL
})

//:divide
//:/ -> divide
const divide = (() => {
    let adr1 = args.split(' ')[0]
    let adr2 = args.split(' ')[1]
    let dest = args.split(' ')[2]

    let num1 = num_memory[adr1]
    let num2 = num_memory[adr2]

    if(!num1) {
        console.log('CRITICAL ERROR: Cannot find integer ' + adr1 + ' in memory at line ' + i + '!')
        return returnAction.CRITICAL
    } else if(!num2) {
        console.log('CRITICAL ERROR: Cannot find integer ' + adr2 + ' in memory at line ' + i + '!')
        return returnAction.CRITICAL
    }

    num_memory[dest] = num1 / num2
    return returnAction.PEACEFUL
})

//:reverse
//:rev -> reverse
const reverse = (() => {
    let adr = args.split(' ')[0]
    let dest = args.split(' ')[1]
    let num = num_memory[adr]

    if(!num) {
        console.log('CRITICAL ERROR: Cannot find integer ' + adr + ' in memory at line ' + i + '!')
        return returnAction.CRITICAL
    }

    num_memory[dest] = -num
    return returnAction.PEACEFUL
})