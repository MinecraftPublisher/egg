#? replace(sub = "\t", by = "    ")

template mod_fs() =
    proc d_read(): returnAction =
        expect("2")

        var filename = args.split(' ')[0]
        var dest = args.split(' ')[1]

        if not str_memory.hasKey filename:
            SetFailure(fmt"Filename does not exist in memory at line {i.n + 1}")
            return returnAction.CRITICAL
        
        str_memory[dest] = readFile(str_memory[filename])
        return returnAction.PEACEFUL
    
    proc d_write(): returnAction =
        expect("2")

        var filename = args.split(' ')[0]
        var data = args.split(' ')[1]

        if not str_memory.hasKey filename:
            SetFailure(fmt"Filename does not exist in memory at line {i.n + 1}")
            return returnAction.CRITICAL
        
        if not str_memory.hasKey data:
            SetFailure(fmt"File contents do not exist in memory at line {i.n + 1}")
            return returnAction.CRITICAL
        
        writeFile(str_memory[filename], str_memory[data])
        return returnAction.PEACEFUL
    
    internals["fs.read"] = d_read
    internals["fs.write"] = d_write

export mod_fs