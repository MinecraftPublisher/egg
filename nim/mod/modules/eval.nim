#? replace(sub = "\t", by = "    ")

template mod_modules_eval() =
    proc eval(): returnAction =
		var str = args
		for mt in str.findAll(re"%{[^} ]+}"):
			var name = mt.substr(2, mt.len - 2)
			var res = (if str_memory.hasKey(name): str_memory[name] 
				elif num_memory.hasKey(name): $(num_memory[name])
				else: "(null)")
			str = str.replace(mt, res)
	
		PROGRAM_REGISTER[filename & " > " & "__vm__"] = str
		var evalresult = egg(str, filename & " > " & "__vm__", registry, num_memory, str_memory)
		trace = concat(trace, evalresult.stackTrace)
		registry = evalresult.registry
		str_memory = evalresult.str_memory
		num_memory = evalresult.num_memory
		return returnAction.PEACEFUL
	
	internals["eval"] = eval

export mod_modules_eval