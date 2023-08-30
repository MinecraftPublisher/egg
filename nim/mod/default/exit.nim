#? replace(sub = "\t", by = "    ")

template mod_default_exit() =
    proc exit(): returnAction =
		expect("0")
		return returnAction.EXIT
	
	internals["exit"] = exit

export mod_default_exit