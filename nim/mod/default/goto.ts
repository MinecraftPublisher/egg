//:goto
const goto = ((segment = args.split(' ')[0]): returnAction => {
    if (!registry[segment] && registry[segment] !== 0) {
        console.log('CRITICAL FAILURE: Couldn\'t find segment \'' + segment + '\' to run goto at line ' + (i + 1) + '!')
        return returnAction.CRITICAL
    }
    stack[stack.length - 1] = i + 1
    stack.push(registry[segment])

    i = registry[segment]
    return returnAction.PEACEFUL
})