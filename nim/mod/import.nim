template importMods() =
    import "default/comment.nim"
    import "default/branch.nim"
    import "default/clear.nim"
    import "default/exit.nim"
    import "default/free.nim"
    import "default/goto.nim"

    import "io/sleep.nim"
    import "io/dump.nim"
    import "io/echo.nim"
    import "io/read.nim"

    import "modules/register.nim"
    import "modules/hush.nim"
    import "modules/eval.nim"
    import "modules/mod.nim"

    import "operations/conditions.nim"
    import "operations/d_string.nim"
    import "operations/d_math.nim"

    import "fs/fs.nim"

export importMods