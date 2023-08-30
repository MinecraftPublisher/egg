#? replace(sub = "\t", by = "    ")

template mod_io_sleep() =
    proc d_sleep(): returnAction =
        expect("1")
        
        try:
            var t = parseFloat(args)
            sleep(t.int)
            return returnAction.PEACEFUL
        except CatchableError:
            SetFailure(fmt"Invalid float provided for sleep duration at line {i.n + 1}")
            return returnAction.CRITICAL

    internals["sleep"] = d_sleep

export mod_io_sleep