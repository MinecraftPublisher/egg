//:fmt -> echo
const fmt = (() => {
    let str = args
    for(let mt of (str.match(/%{[^} ]+}/g) ?? [])) {
        let name = mt.substring(2, mt.length - 1)
        str = str.replaceAll(mt, str_memory[name] ?? num_memory[name]?.toString() ?? '(null)')
    }

    console.log(str)
    return returnAction.PEACEFUL
})