template mod_modules_hush() =
    proc hush(): returnAction =
        FailureReason = ""
        num_memory["hush"] = 0
        TRY_CATCH = true

        var str = args
        var founds = str.findAll(re"%{[^} ]+}")
        for mt in founds:
            var name = mt.substr(2, mt.len - 2)
            var res = (if str_memory.hasKey(name): str_memory[name] 
                elif num_memory.hasKey(name): $(num_memory[name])
                else: "(null)")
            str = str.replace(mt, res)
    
        PROGRAM_REGISTER[filename & " > " & "__hush__"] = str
        var evalresult = egg(str, filename & " > " & "__hush__", registry, num_memory, str_memory)
        trace = concat(trace, evalresult.stackTrace)
        registry = evalresult.registry
        str_memory = evalresult.str_memory
        num_memory = evalresult.num_memory

        str_memory["reason"] = FailureReason
        if FailureReason != "":
            num_memory["hush"] = 0
            FailureReason = ""
        else:
            num_memory["hush"] = 1
        
        TRY_CATCH = false
        return returnAction.PEACEFUL
    
    internals["hush"] = hush

export mod_modules_hush