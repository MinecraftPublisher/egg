#? replace(sub = "\t", by = "    ")
	
template mod_modules_mod() =
	const BUILTIN: Table[string, string] = {
		"test": "echo This is a test module."
	}.toTable
	
	proc d_mod(): returnAction =
		proc getDir(path = "./", depth = 0): string =
			if dirExists(path) and depth < 5:
				if dirExists(path & ".egg"):
					return path & ".egg/"
				else:
					return getDir(path & "../", depth + 1)
			else:
				return ""
		
		var eggpath {.inject.} = getDir()
	
		if args.endsWith(".egg") and (args.startswith("./") or args.startsWith("../") or args.startsWith("/")):
			if not fileExists(args):
				SetFailure(fmt"Couldn't find file '{args}' in filesystem to import at line {i.n + 1}")
				return returnAction.CRITICAL
	
	        PROGRAM_REGISTER[filename & " > " & args] = readFile(args)
			var evalresult = egg(readFile(args), filename & " > " & args, registry, num_memory, str_memory)
			trace = concat(trace, evalresult.stackTrace)
			registry = evalresult.registry
			str_memory = evalresult.str_memory
			num_memory = evalresult.num_memory
			
			return returnAction.PEACEFUL
		elif BUILTIN.hasKey args:
		    PROGRAM_REGISTER[filename & " > " & args] = BUILTIN[args]
			var evalresult = egg(BUILTIN[args], args & " > " & args, registry, num_memory, str_memory)
			trace = concat(trace, evalresult.stackTrace)
			registry = evalresult.registry
			str_memory = evalresult.str_memory
			num_memory = evalresult.num_memory
	
			return returnAction.PEACEFUL
		else:
			if fileExists(eggpath & args & ".egg"):
			    PROGRAM_REGISTER[filename & " > " & args & ".egg"] = readFile(eggpath & args & ".egg")
				var evalresult = egg(readFile(eggpath & args & ".egg"), filename & " > " & args & ".egg", registry, num_memory, str_memory)
				trace = concat(trace, evalresult.stackTrace)
				registry = evalresult.registry
				str_memory = evalresult.str_memory
				num_memory = evalresult.num_memory
			
				return returnAction.PEACEFUL
			else:
				SetFailure(fmt"Couldn't find package '{args}' in internal package repository or the registry to import at line {i.n + 1} (detected package directory: {eggpath})")
				return returnAction.CRITICAL

	internals["mod"] = d_mod

export mod_modules_mod