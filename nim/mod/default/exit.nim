#? replace(sub = "\t", by = "    ")

template mod_default_exit() =
    proc exit(): returnAction =
		return returnAction.EXIT
	
	internals["exit"] = exit

export mod_default_exit