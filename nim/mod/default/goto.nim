template mod_default_goto() =
    proc goto(): returnAction =
        expect("1")

        var segment {.inject.} = args.split(' ')[0]
        if(not registry.hasKey(segment) and registry[segment].n != 0):
            SetFailure(fmt"Couldn't find segment '{segment}' to run goto at line {i.n + 1}")
            return returnAction.CRITICAL

        stack[stack.len - 1].n = i.n + 1
        stack.add(registry[segment])

        i = registry[segment]
        return returnAction.CONTINUE

    internals["goto"] = goto

export mod_default_goto