#? replace(sub = "\t", by = "    ")

import strformat, strutils, sequtils, tables, re, os, sugar

type returnAction = enum
	PEACEFUL = 0,
	CONTINUE = 1,
	EXIT = 2,
	CRITICAL = 3

type Trace = object
	n: int
	program: string

type Registry = Table[string, Trace]
type NumberMemory = Table[string, float]
type StringMemory = Table[string, string]

type Action = proc(): returnAction
type Internals = Table[string, Action]

type Return = object
	stackTrace: seq[Trace]
	registry: Registry
	num_memory: NumberMemory
	str_memory: StringMemory

type Eggception = ref object of CatchableError
	stackTrace: seq[Trace]
	registry: Registry
	num_memory: NumberMemory
	str_memory: StringMemory

proc Inception(iturn: Return) =
	var e: Eggception
	new(e)

	e.stackTrace = concat(iturn.stackTrace, @[Trace(n: -1,
			program: "CRITICAL")])
	e.registry = iturn.registry
	e.num_memory = iturn.num_memory
	e.str_memory = iturn.str_memory

	e.msg = "Critical program exit"
	raise e

var PROGRAM_REGISTER: Table[string, string] = initTable[string, string]()

proc egg(code: string, c_filename: string, c_registry: Registry,
		c_num_memory: NumberMemory, c_str_memory: StringMemory): Return =
	var stack: seq[Trace] = @[]
	var trace: seq[Trace] = @[]

	var filename = c_filename

	var registry = c_registry
	var num_memory = c_num_memory
	var str_memory = c_str_memory

	var i: Trace = Trace(n: -1, program: filename)

	stack.add(i)
	while i.n < PROGRAM_REGISTER[filename].split('\n').len:
	    i.n += 1
	    if i.n >= PROGRAM_REGISTER[filename].split('\n').len: continue
		var line = PROGRAM_REGISTER[filename].split('\n')[i.n]
		trace.add(i)

		if line == "": continue
		stack[stack.len - 1] = i

		if line.startsWith(':'):
			if stack.len != 1:
				discard stack.pop
				i = stack[stack.len - 1]

				continue

			var name = line.substr(1).split(' ')[0]
			registry[name] = i

			if name != "main":
				i.n += 1
				while i.n < PROGRAM_REGISTER[filename].split('\n').len and (not PROGRAM_REGISTER[filename].split('\n')[i.n].startsWith(":main")):
					if PROGRAM_REGISTER[filename].split('\n')[i.n].startsWith(":"):
						var name = PROGRAM_REGISTER[filename].split('\n')[i.n].substr(1).split(' ')[0]
						registry[name] = i
					i.n += 1
					# if i.n >= PROGRAM_REGISTER[filename].split('\n').len: break
			continue

		if line.startsWith("str::"):
			var name = line.substr(5).split(' ')[0]
			try:
			    discard parseFloat(name)
				echo fmt"CRITICAL FAILURE: Variable name cannot be an integer constant at line {i.n + 1}!"
				return Return(
					stackTrace: concat(trace, @[Trace(n: -1,
				        program: "CRITICAL")]),
					registry: registry,
					num_memory: num_memory,
					str_memory: str_memory
				)
			except CatchableError:
			    var args = line.substr(name.len + 6)
			    str_memory[name] = args
			    continue

		elif line.startsWith("num::"):
			var name = line.substr(5).split(' ')[0]
			try:
			    discard parseFloat(name)
			    echo fmt"CRITICAL FAILURE: Variable name cannot be an integer constant at line {i.n + 1}!"
			    return Return(
			    	stackTrace: concat(trace, @[Trace(n: -1,
						program: "CRITICAL")]),
			    	registry: registry,
			    	num_memory: num_memory,
			    	str_memory: str_memory
			    )
			except CatchableError:
			    try:
				    var args = parseFloat(line.substr(name.len + 6))
				    num_memory[name] = args
				    continue
			    except CatchableError:
    				echo fmt"CRITICAL FAILURE: Couldn't convert '{line.substr(name.len + 6)}' to number at line {i.n + 1}!"
	    			return Return(
		    			stackTrace: concat(trace, @[Trace(n: -1,
			    				program: "CRITICAL")]),
				    	registry: registry,
    					num_memory: num_memory,
	    				str_memory: str_memory
		    		)

		var command = line.split(' ')[0]
		var args = line.substr(command.len + 1)

		var internals: Internals = initTable[string, Action]()

		mod_default_comment()
		mod_default_free()
		mod_default_branch()
		mod_default_exit()
		mod_default_goto()

		mod_io_dump()
		mod_io_echo()
		mod_io_read()

		mod_modules_mod()
		mod_modules_eval()

		mod_operations_math()

		#[
			--------------------------------------------------------------------
			File: mod/operations/string.nim
			-------------------------------------------------------------------- 
		]#

		#[
			--------------------------------------------------------------------
			File: mod/operations/conditions.nim
			-------------------------------------------------------------------- 
		]#

		command = command.replace('.', '_')
		var isInternal = internals.hasKey command

		if isInternal:
			let returnValue = internals[command]()

			if returnValue == returnAction.CONTINUE: continue
			elif returnValue == returnAction.PEACEFUL: discard
			elif returnValue == returnAction.CRITICAL:
				Inception(Return(
					stackTrace: trace,
					registry: registry,
					num_memory: num_memory,
					str_memory: str_memory
				))
			elif returnValue == returnAction.EXIT:
				return Return(
					stackTrace: concat(trace, @[Trace(n: -1, program: "EXIT")]),
					registry: registry,
					num_memory: num_memory,
					str_memory: str_memory
				)
		else:
			echo fmt"CRITICAL FAILURE: Couldn't spot internal function '{command}' at line {i.n + 1}!"

			return Return(
					stackTrace: concat(trace, @[Trace(n: -1,
							program: "CRITICAL")]),
					registry: registry,
					num_memory: num_memory,
					str_memory: str_memory
			)

	return Return(
		stackTrace: trace,
		registry: registry,
		num_memory: num_memory,
		str_memory: str_memory
	)

const DEVOLVE = "REVOLVER"

proc help() =
	echo "Usage:"
	echo "      "
	echo "		egg run [files]"

if paramCount() > 0:
    var cmd = paramStr(1)
    if cmd == "help":
        help()
    elif cmd == "run":
	    var registry = initTable[string, Trace]()
	    var num_memory = initTable[string, float]()
	    var str_memory = initTable[string, string]()
    
    	for i in 2..paramCount():
    		var name = paramStr(i)
    		var file = readFile(name)
    		PROGRAM_REGISTER[name] = file
    		var ret = file.egg(name, registry, num_memory, str_memory)
    
    		registry = ret.registry
    		num_memory = ret.num_memory
    		str_memory = ret.str_memory
    elif cmd == "compile":
        var path = getAppFilename()
        # var f = open(path, fmReadWriteExisting)
        # var size = f.getFileSize()
        var text = readFile(path)
else:
    help()
