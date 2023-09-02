template mod_default_branch() = 
    proc branch(): returnAction =
        expect("3")

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
            SetFailure(fmt"Condition memory address at line {i.n + 1} not provided")
            return returnAction.CRITICAL
                
        var condition: bool
        if str_memory.hasKey(addcond):
            condition = not (str_memory[addcond] == "" or str_memory[addcond] == "false")
        elif num_memory.hasKey(addcond):
            condition = num_memory[addcond] != 0
        else:
            SetFailure(fmt"Condition memory address at line {i.n + 1} was not found in memory")
            return returnAction.CRITICAL

        if condition:
            if trueCase.n == i.n and trueCase.program == i.program:
                SetFailure(fmt"True case memory address at line {i.n + 1} not provided")
                return returnAction.CRITICAL

            stack[stack.len - 1] = i
            stack.add(trueCase)
            i = trueCase
            # i.n += 1
            return returnAction.CONTINUE
        else:
            if falseCase.n == i.n and falseCase.program == i.program:
                echo falseCase
                SetFailure(fmt"False case memory address at line {i.n + 1} not provided")
                return returnAction.CRITICAL

            stack[stack.len - 1] = i
            stack.add(falseCase)
            i = falseCase
            # i.n += 1
            return returnAction.CONTINUE

    internals["branch"] = branch
    internals["if"] = branch

export mod_default_branch