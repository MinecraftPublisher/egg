#? replace(sub = "\t", by = "    ")

template mod_operations_string() =
    proc d_string_split() =
        var spl = args.split(' ')
        if spl.len < 1:
            echo "CRITICAL FAILURE: No arguments provided for split at line {i.n + 1}!"
            return returnAction.CRITICAL
        if spl.len < 2:
            echo "CRITICAL FAILURE: Source string and destination for split not provided at line {i.n + 1}"
            return returnAction.CRITICAL
        if spl.len < 3:
            echo "CRITICAL FAILURE: Destination string for split not provided at line {i.n + 1}!"
            return returnAction.CRITICAL

        var sep = spl[0]
        var str = spl[1]
        var dest = spl[2]

        if not str_memory.hasKey sep:
            echo "CRITICAL FAILURE: Could not find separator adress in memory at line {i.n + 1}!"
            return returnAction.CRITICAL
        if not str_memory.hasKey str:
            echo "CRITICAL FAILURE: Could not find string adress in memory at line {i.n + 1}!"
            return returnAction.CRITICAL

        dest = str.split(sep)
    
    proc d_string_index() = 
        var spl = args.split(' ')
        if spl.len < 1:
            echo "CRITICAL FAILURE: No arguments provided for index at line {i.n + 1}!"
            return returnAction.CRITICAL
        if spl.len < 2:
            echo "CRITICAL FAILURE: Source string and destination for index not provided at line {i.n + 1}"
            return returnAction.CRITICAL
        if spl.len < 3:
            echo "CRITICAL FAILURE: Destination string for index not provided at line {i.n + 1}!"
            return returnAction.CRITICAL

        var sep = spl[0]
        var str = spl[1]
        var dest = spl[2]

    internals["string.split"] = d_string_split
