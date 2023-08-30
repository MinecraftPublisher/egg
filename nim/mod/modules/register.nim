template mod_modules_register() =
    proc d_register(): returnAction =
        var spl = args.split(' ')

        var name = spl[0]
        var description = spl[2]
        var arguments = spl[1]

        if num_memory[arguments] > 100:
            SetFailure("Functions cannot have more than 100 input arguments.")
            return returnAction.CRITICAL

        database[name] = Register(location: registry[name], description: str_memory[description], argumentCount: num_memory[arguments].int)
        return returnAction.PEACEFUL
    
    internals["reg"] = d_register
    internals["registry"] = d_register

export mod_modules_register