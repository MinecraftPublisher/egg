#? replace(sub = "\t", by = "    ")

template mod_default_free() =
    proc free(): returnAction =
        num_memory.del(args)
        str_memory.del(args)
        return returnAction.CONTINUE

    internals["free"] = free

export mod_default_free