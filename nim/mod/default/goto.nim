#? replace(sub = "\t", by = "    ")

template mod_default_goto() =
    proc goto(): returnAction =
	    var segment {.inject.} = args.split(' ')[0]
	    if(not registry.hasKey(segment) and registry[segment].n != 0):
		    echo fmt"CRITICAL FAILURE: Couldn't find segment '{segment}' to run goto at line {i.n + 1}!"
		    return returnAction.CRITICAL

	    stack[stack.len - 1].n = i.n + 1
	    stack.add(registry[segment])

	    i = registry[segment]
	    return returnAction.PEACEFUL

	internals["goto"] = goto

export mod_default_goto