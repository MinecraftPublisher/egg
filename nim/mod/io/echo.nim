template mod_io_echo() =
    proc d_echo(): returnAction =
        var str = args
        for mt in str.findAll(re"%{[^} ]+}"):
            var name = mt.substr(2, mt.len - 2)
            var res = (if str_memory.hasKey(name): str_memory[name] 
                elif num_memory.hasKey(name): $(num_memory[name])
                else: "(null)")
            str = str.replace(mt, res)
        
        echo str
        return returnAction.PEACEFUL

    proc printf(): returnAction =
        var str = args
        for mt in str.findAll(re"%{[^} ]+}"):
            var name = mt.substr(2, mt.len - 2)
            var res = (if str_memory.hasKey(name): str_memory[name] 
                elif num_memory.hasKey(name): $(num_memory[name])
                else: "(null)")
            str = str.replace(mt, res)
        
        stdout.write str
        return returnAction.PEACEFUL
    
    internals["echo"] = d_echo
    internals["printf"] = printf

export mod_io_echo