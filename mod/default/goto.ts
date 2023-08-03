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