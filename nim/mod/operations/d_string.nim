#? replace(sub = "\t", by = "    ")

template mod_operations_d_string() =
    proc d_string_split(): returnAction =
        var spl {.inject.} = args.split(' ')
        if spl.len < 1:
            SetFailure(fmt"No arguments provided for split at line {i.n + 1}")
            return returnAction.CRITICAL
        if spl.len < 2:
            SetFailure(fmt"Source string and destination for split not provided at line {i.n + 1}")
            return returnAction.CRITICAL
        if spl.len < 3:
            SetFailure(fmt"Destination string for split not provided at line {i.n + 1}")
            return returnAction.CRITICAL

        var sep {.inject.} = spl[0]
        var str {.inject.} = spl[1]
        var ind {.inject.} = spl[2]
        var dest {.inject.} = spl[3]

        if not str_memory.hasKey sep:
            SetFailure(fmt"Could not find separator adress in memory at line {i.n + 1}")
            return returnAction.CRITICAL
        elif not num_memory.hasKey ind:
            SetFailure(fmt"Could not find index adress in memory at line {i.n + 1}")
            return returnAction.CRITICAL
        elif not str_memory.hasKey str:
            SetFailure(fmt"Could not find string adress in memory at line {i.n + 1}")
            return returnAction.CRITICAL
        else:
            var strstr: string = str_memory[str]
            var sepsep: string = str_memory[sep]
            var res: string = strstr.split(sepsep[0])[num_memory[ind].int]
            str_memory[dest] = res
    
    proc d_string_index(): returnAction = 
        var spl {.inject.} = args.split(' ')
        if spl.len < 1:
            SetFailure(fmt"No arguments provided for index at line {i.n + 1}")
            return returnAction.CRITICAL
        if spl.len < 2:
            SetFailure(fmt"Source string and destination for index not provided at line {i.n + 1}")
            return returnAction.CRITICAL
        if spl.len < 3:
            SetFailure(fmt"Destination string for index not provided at line {i.n + 1}")
            return returnAction.CRITICAL

        var index {.inject.} = spl[0]
        var str {.inject.} = spl[1]
        var dest {.inject.} = spl[2]

        if not num_memory.hasKey index:
            SetFailure(fmt"Could not find index adress in memory at line {i.n + 1}")
            return returnAction.CRITICAL
        elif not str_memory.hasKey str:
            SetFailure(fmt"Could not find string adress in memory at line {i.n + 1}")
            return returnAction.CRITICAL
        else:
            var st {.inject.} = str_memory[str]
            var it {.inject.} = num_memory[index].int

            if st.len > it:
                str_memory[dest] = $(st[it])
            else:
                str_memory[dest] = ""
    
    proc d_string_append(): returnAction =
        var spl {.inject.} = args.split(' ')
        var dest {.inject.} = spl[0]
        var str1 {.inject.} = spl[1]
        var str2 {.inject.} = spl[2]

        if spl.len < 1:
            SetFailure(fmt"No arguments provided for append at line {i.n + 1}")
            return returnAction.CRITICAL
        if spl.len < 2:
            SetFailure(fmt"First and second source for append not provided at line {i.n + 1}")
            return returnAction.CRITICAL
        if spl.len < 3:
            SetFailure(fmt"Destination string for append not provided at line {i.n + 1}")
            return returnAction.CRITICAL
        
        if not str_memory.hasKey str1:
            SetFailure(fmt"First source for append not found in memory at line {i.n + 1}")
            return returnAction.CRITICAL
        elif not str_memory.hasKey str2:
            SetFailure(fmt"Second source for append not found in memory at line {i.n + 1}")
            return returnAction.CRITICAL
        else:
            str_memory[dest] = str_memory[str1] & str_memory[str2]
        return returnAction.PEACEFUL

    internals["string.append"] = d_string_append
    internals["string.split"] = d_string_split
    internals["string.index"] = d_string_index

export mod_operations_d_string