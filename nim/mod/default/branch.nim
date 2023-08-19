#? replace(sub = "\t", by = "    ")

template mod_default_branch() = 
    proc branch(): returnAction =
    	var addcond = args.split(' ')[0]
		var trueCase = (
			if registry.hasKey(args.split(' ')[1]):
				registry[args.split(' ')[1]]
			else:
				i)
		var falseCase = (
			if registry.hasKey(args.split(' ')[2]):
				registry[args.split(' ')[2]]
			else:
				i)
			
		if addcond.isEmptyOrWhitespace:
			echo fmt"CRITICAL FAILURE: Condition memory address at line {i.n + 1} not provided!"
			return returnAction.CRITICAL
		elif trueCase.n == i.n + 1:
			echo fmt"CRITICAL FAILURE: True case memory address at line {i.n + 1} not provided!"
			return returnAction.CRITICAL
		elif falseCase.n == i.n + 1:
			echo fmt"CRITICAL FAILURE: False case memory address at line {i.n + 1} not provided!"
			return returnAction.CRITICAL
				
		var condition: bool
		if str_memory.hasKey(addcond):
			condition = (str_memory[addcond] == "" or str_memory[addcond] == "false")
		elif num_memory.hasKey(addcond):
			condition = num_memory[addcond] != 0
		else:
			echo fmt"CRITICAL FAILURE: Condition memory address at line {i.n + 1} was not found in memory!"
			return returnAction.CRITICAL

		if condition:
			stack[stack.len - 1] = i
			stack.add(trueCase)
			i = trueCase
			# i.n += 1
			return returnAction.CONTINUE
		else:
			stack[stack.len - 1] = i
			stack.add(falseCase)
			i = falseCase
			# i.n += 1
			return returnAction.CONTINUE

	internals["branch"] = branch
	internals["if"] = branch

export mod_default_branch