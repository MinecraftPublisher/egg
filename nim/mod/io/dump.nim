#? replace(sub = "\t", by = "    ")

template mod_io_dump() = 
    proc dump(): returnAction =
		expect("1")

		if str_memory.hasKey(args.split(' ')[0]): 
			echo str_memory[args.split(' ')[0]] 
		elif num_memory.hasKey(args.split(' ')[0]):
		    echo num_memory[args.split(' ')[0]]
		else:
			echo "(null)"
			
		return returnAction.PEACEFUL

	internals["dump"] = dump

export mod_io_dump