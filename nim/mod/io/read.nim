template mod_io_read() =
    proc read(): returnAction =
        expect("1")

        var l = readLine(stdin)
        var target = args

        str_memory[target] = l
        return returnAction.PEACEFUL

    proc readInt(): returnAction =
        expect("1")
        
        var l = readLine(stdin)
        var target = args

        try:
            var n = parseFloat(l)
            num_memory[target] = n
            return returnAction.PEACEFUL
        except CatchableError:
            SetFailure(fmt"CRITICAL ERROR: Input from stdin is not a number at line {i.n + 1}")
            return returnAction.CRITICAL

    internals["numread"] = readInt
    internals["readnum"] = readInt
    internals["read"] = read

export mod_io_read