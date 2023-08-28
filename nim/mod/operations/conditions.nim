#? replace(sub = "\t", by = "    ")

template mod_operations_conditions() =
    proc cond(sthandler {.inject.} : (string, string) -> bool, handler: (float, float) -> bool): returnAction =
        var dest = args.split(' ')[0]
        var left {.inject.} = args.split(' ')[1]
        var right {.inject.} = args.split(' ')[2]

        if (not str_memory.hasKey left) and (not num_memory.hasKey left):
            SetFailure(fmt"Left hand '{left}' does not exist in memory at line {i.n + 1}")
            return returnAction.CRITICAL
        if (not str_memory.hasKey right) and (not num_memory.hasKey right):
            SetFailure(fmt"Right hand '{right}' does not exist in memory at line {i.n + 1}")
            return returnAction.CRITICAL

        if str_memory.hasKey left:
            if str_memory.hasKey right:
                num_memory[dest] = (if sthandler(str_memory[left], str_memory[right]): 1 else: 0)
                return returnAction.PEACEFUL
            else:
                num_memory[dest] = 0
                return returnAction.PEACEFUL
        elif num_memory.hasKey left:
            if num_memory.hasKey right:
                num_memory[dest] = (if handler(num_memory[left], num_memory[right]): 1 else: 0)
                return returnAction.PEACEFUL
            else:
                num_memory[dest] = 0
                return returnAction.PEACEFUL
    
    proc d_equals(): returnAction = 
        return cond((a, b) => a == b, (a, b) => a == b)

    internals["equals"] = d_equals
    internals["eq"] = d_equals
    internals["="] = d_equals
    
    proc d_more(): returnAction = 
        return cond((a, b) => 0, (a, b) => a > b)

    internals["morethan"] = d_more
    internals["more"] = d_more
    internals[">"] = d_more

    proc d_less(): returnAction =
        return cond((a, b) => 0, (a, b) => a < b)
    
    internals["lessthan"] = d_less
    internals["less"] = d_less
    internals["<"] = d_less

    proc d_moreq(): returnAction =
        return cond((a, b) => 0, (a, b) => a >= b)

    internals["morequals"] = d_moreq
    internals["meq"] = d_moreq
    internals[">="] = d_moreq
    
    proc d_lessq(): returnAction =
        return cond((a, b) => 0, (a, b) => a <= b)

    internals["lessequals"] = d_lessq
    internals["leq"] = d_lessq
    internals["<="] = d_lessq

    proc d_and(): returnAction =
        return cond((a, b) => a != "" and b != "", (a, b) => a != 0 and b != 0)

    internals["and"] = d_and
    internals["&"] = d_and

    proc d_or(): returnAction =
        return cond((a, b) => a != "" or b != "", (a, b) => a != 0 or b != 0)

    internals["or"] = d_or
    internals["|"] = d_or

    proc d_not(): returnAction =
        var left {.inject.} = args.split(' ')[0]
        var dest = args.split(' ')[1]

        if (not str_memory.hasKey left) or (not num_memory.hasKey left):
            SetFailure(fmt"Variable '{left}' does not exist in memory at line {i.n + 1}")
            return returnAction.CRITICAL

        if str_memory.hasKey left:
            num_memory[dest] = (if str_memory[left] == "": 1 else: 0)
            return returnAction.PEACEFUL
        elif num_memory.hasKey dest:
            num_memory[dest] = (if num_memory[left] == 0: 0 else: 1)
            return returnAction.PEACEFUL
    
    internals["not"] = d_not
    internals["!"] = d_not
        

export mod_operations_conditions