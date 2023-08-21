#? replace(sub = "\t", by = "    ")

import strformat, strutils, sequtils, tables, re, os, sugar, math

import "mod/import.nim"
importMods()

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

var PROGRAM_REGISTER: Table[string, string] = initTable[string, string]()

proc Inception(iturn: Return) =
	var e: Eggception
	new(e)

	e.stackTrace = concat(iturn.stackTrace, @[Trace(n: -1,
			program: "CRITICAL")])
	e.registry = iturn.registry
	e.num_memory = iturn.num_memory
	e.str_memory = iturn.str_memory

	var file = PROGRAM_REGISTER[e.stackTrace[e.stackTrace.len - 2].program]
	var content = file.split('\n')[e.stackTrace[e.stackTrace.len - 2].n]
	e.msg = fmt"Critical program exit. Line '{e.stackTrace[e.stackTrace.len - 2].n}' " & 
		fmt"Program '{e.stackTrace[e.stackTrace.len - 2].program}' Content '{content}'"
	raise e

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

		line = line.replace("\\#", "__TAG__").split('#')[0].replace("__TAG__", "#")
		if line == "": continue
		trace.add(i)
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
			# try:
			    # discard parseFloat(name)
				# echo fmt"CRITICAL FAILURE: Variable name cannot be an integer constant at line {i.n + 1}!"
				# return Return(
				# 	stackTrace: concat(trace, @[Trace(n: -1,
				#         program: "CRITICAL")]),
				# 	registry: registry,
				# 	num_memory: num_memory,
				# 	str_memory: str_memory
				# )
			# except CatchableError:
			
			var space = line.findAll(re"[ \t]+")[0].len
			var args = line.substr(name.len + space + 5)
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
				var space = line.findAll(re"[ \t]+")[0].len
			    try:
				    var args = parseFloat(line.substr(name.len + space + 5))
				    num_memory[name] = args
				    continue
			    except CatchableError:
    				echo fmt"CRITICAL FAILURE: Couldn't convert '{line.substr(name.len + space + 5)}' to number at line {i.n + 1}!"
	    			return Return(
		    			stackTrace: concat(trace, @[Trace(n: -1,
			    				program: "CRITICAL")]),
				    	registry: registry,
    					num_memory: num_memory,
	    				str_memory: str_memory
		    		)

		var command = line.split(re"[ \t]+")[0]
		var space = line.findAll(re"[ \t]+")[0].len
		var args = line.substr(command.len + space)

		var internals: Internals = initTable[string, Action]()

		mod_default_comment()
		mod_default_free()
		mod_default_branch()
		mod_default_exit()
		mod_default_goto()

		mod_io_dump()
		mod_io_echo()
		mod_io_read()
		mod_io_sleep()

		mod_modules_mod()
		mod_modules_eval()

		mod_operations_math()
		mod_operations_d_string()

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

if DEVOLVE == "00000000":
	# compilation mode
	echo "Bundled egg"

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
		# to be implemented!
		discard
else:
    help()
