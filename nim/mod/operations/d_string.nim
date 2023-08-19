#? replace(sub = "\t", by = "    ")

template mod_operations_d_string() =
    proc d_string_split(): returnAction =
        var spl {.inject.} = args.split(' ')
        if spl.len < 1:
            echo "CRITICAL FAILURE: No arguments provided for split at line {i.n + 1}!"
            return returnAction.CRITICAL
        if spl.len < 2:
            echo "CRITICAL FAILURE: Source string and destination for split not provided at line {i.n + 1}"
            return returnAction.CRITICAL
        if spl.len < 3:
            echo "CRITICAL FAILURE: Destination string for split not provided at line {i.n + 1}!"
            return returnAction.CRITICAL

        var sep {.inject.} = spl[0]
        var str {.inject.} = spl[1]
        var ind {.inject.} = spl[2]
        var dest {.inject.} = spl[3]

        if not str_memory.hasKey sep:
            echo "CRITICAL FAILURE: Could not find separator adress in memory at line {i.n + 1}!"
            return returnAction.CRITICAL
        elif not num_memory.hasKey ind:
            echo "CRITICAL FAILURE: Could not find index adress in memory at line {i.n + 1}!"
            return returnAction.CRITICAL
        elif not str_memory.hasKey str:
            echo "CRITICAL FAILURE: Could not find string adress in memory at line {i.n + 1}!"
            return returnAction.CRITICAL
        else:
            var strstr: string = str_memory[str]
            var sepsep: string = str_memory[sep]
            var res: string = strstr.split(sepsep[0])[num_memory[ind].int]
            str_memory[dest] = res
    
    proc d_string_index(): returnAction = 
        var spl {.inject.} = args.split(' ')
        if spl.len < 1:
            echo "CRITICAL FAILURE: No arguments provided for index at line {i.n + 1}!"
            return returnAction.CRITICAL
        if spl.len < 2:
            echo "CRITICAL FAILURE: Source string and destination for index not provided at line {i.n + 1}"
            return returnAction.CRITICAL
        if spl.len < 3:
            echo "CRITICAL FAILURE: Destination string for index not provided at line {i.n + 1}!"
            return returnAction.CRITICAL

        var index {.inject.} = spl[0]
        var str {.inject.} = spl[1]
        var dest {.inject.} = spl[2]

        if not num_memory.hasKey index:
            echo "CRITICAL FAILURE: Could not find index adress in memory at line {i.n + 1}!"
            return returnAction.CRITICAL
        elif not str_memory.hasKey str:
            echo "CRITICAL FAILURE: Could not find string adress in memory at line {i.n + 1}!"
            return returnAction.CRITICAL
        else:
            str_memory[dest] = fmt"{str_memory[str][num_memory[index].int]}"

    internals["string.split"] = d_string_split
    internals["string.index"] = d_string_index

export mod_operations_d_string