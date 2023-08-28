#? replace(sub = "\t", by = "    ")

template mod_modules_register() =
    proc d_register(): returnAction =
        discard
    
    discard d_register()

export mod_modules_register