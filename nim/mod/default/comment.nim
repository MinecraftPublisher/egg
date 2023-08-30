template mod_default_comment() =
    proc comment(): returnAction =
        return returnAction.PEACEFUL

    internals["comment"] = comment
    internals["#"] = comment

export mod_default_comment