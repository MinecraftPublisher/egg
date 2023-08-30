#? replace(sub = "\t", by = "    ")

template mod_operations_math() =
	proc op(handler: (float, float) -> float): returnAction =
	    expect("3")

		var adr1 {.inject.} = spl[1]
		var adr2 {.inject.} = spl[2]
		var dest = spl[0]

		try:
		    discard parseFloat(dest)
		    SetFailure(fmt"Destination memory address cannot be a number at line {i.n + 1}")
		    return returnAction.CRITICAL
		except CatchableError:
		    discard

	    try:
			var num1 = parseFloat(adr1)
			try:
			    var num2 = parseFloat(adr2)

			    num_memory[dest] = handler(num1, num2)
			    return returnAction.PEACEFUL
			except CatchableError:
			    if not num_memory.hasKey adr2:
			    	SetFailure(fmt"Cannot find number {adr2} in memory at line {i.n + 1}")
			    	return returnAction.CRITICAL
			    
			    var num2 = num_memory[adr2]
			    
			    num_memory[dest] = handler(num1, num2)
			    return returnAction.PEACEFUL
	    except CatchableError:
		    if not num_memory.hasKey adr1:
			    SetFailure(fmt"Cannot find number {adr1} in memory at line {i.n + 1}")
			    return returnAction.CRITICAL
		    elif not num_memory.hasKey adr2:
			    SetFailure(fmt"Cannot find number {adr2} in memory at line {i.n + 1}")
			    return returnAction.CRITICAL
		    else:
			    var num1 = num_memory[adr1]
			    var num2 = num_memory[adr2]

			    num_memory[dest] = handler(num1, num2)
			    return returnAction.PEACEFUL
	
	proc d_add(): returnAction =
		return op((a, b) => a + b)

	internals["add"] = d_add
	internals["+"] = d_add

	proc subtract(): returnAction =
		return op((a, b) => a - b)

	internals["subtract"] = subtract
	internals["sub"] = subtract
	internals["-"] = subtract

	proc multiply(): returnAction =
		return op((a, b) => a * b)

	internals["multiply"] = multiply
	internals["mul"] = multiply
	internals["*"] = multiply

	proc divide(): returnAction =
		return op((a, b) => a / b)

	internals["divide"] = divide
	internals["div"] = divide
	internals["/"] = divide

	proc power(): returnAction =
		return op((a, b) => pow(a, b))

	internals["power"] = power
	internals["pow"] = power
	internals["**"] = power

export mod_operations_math