//:echo
const echo = ((): returnAction => {
    if (DEBUG) {
        let varname = args.split(' ')[0]
        let space = longest - varname.length
        space = space < 0 ? 0 : space
        console.log(`[${varname}]${new Array(space).fill(' ').join('')}| ` + (str_memory[varname] ?? num_memory[varname] ?? '(null)'))
    } else {
        console.log(str_memory[args.split(' ')[0]] ?? '(null)')
    }

    return returnAction.PEACEFUL
})