template mod_default_clear() =
    proc clear(): returnAction =
        if defined(windows): discard execCmd("cls")
        else: discard execCmd("clear")
        
        return returnAction.PEACEFUL

    internals["clear"] = clear

export mod_default_clear