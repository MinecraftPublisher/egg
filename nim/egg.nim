#? replace(sub = "\t", by = "    ")

const VERSION = "1.5"

import strformat, strutils, sequtils, tables, re, os, sugar, math, terminal

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

type Register = object
	location: Trace
	description: string
	argumentCount: int

var PROGRAM_REGISTER: Table[string, string] = initTable[string, string]()
var database: Table[string, Register] = initTable[string, Register]()

var FailureReason = ""
proc SetFailure(reason: string) =
	FailureReason = reason

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
	echo ""
	styledEcho fgRed, styleBright, "[🔎] Stack trace:"
	var program = ""
	for i in 0..(e.stackTrace.len - 2):
		var val = e.stackTrace[i]
		var depth = val.program.split('>').len
		var count = 0

		if val.program.startsWith(program) and (program != val.program) and (" > " in val.program):
			# echo "hi"
			var subprogram = val.program[(program.len + 3)..(val.program.len - 1)]

			echo ""
			count = 0

			for i in 0..(depth - 2):
				stdout.write "    "
				count += 4
			
			var echovar = fmt"[📄] Program '{subprogram}'"
			count += echovar.len
			styledEcho fgGreen, styleBright, echovar

			program = val.program
			stdout.write "    "

		elif program.startsWith(val.program) and (program != val.program):
			var subprogram = program[0..(val.program.len - 1)]

			echo ""
			count = 0

			for i in 0..(depth - 2):
				stdout.write "    "
				count += 4
			
			program = subprogram

		elif program != val.program:
			program = val.program

			var echovar = fmt"[📄] Program '{val.program}'"
			count += echovar.len
			styledEcho fgGreen, styleBright, echovar
		
		var echovar = fmt"    Line {val.n + 1}"
		count += echovar.len
		
		styledEcho fgMagenta, echovar, resetStyle #, " (", fgWhite, bgBlue, styleBright, PROGRAM_REGISTER[val.program].split('\n')[val.n], resetStyle, ")"
		# echo fmt"{PROGRAM_REGISTER[val.program].split('\n')[val.n]}` )"
	
	echo ""
	var val = e.stackTrace[e.stackTrace.len - 2]
	# styledEcho fgYellow, styleBright, "[📎] Critical error occured here '", fgCyan, val.program, fgYellow, "' line ", fgCyan, $(val.n + 1)
	styledEcho fgYellow, styleBright, "[❌] CRITICAL ERROR: ", fgCyan, FailureReason, "!"
	styledEcho fgYellow, styleBright, "[❗️] Critical program exit. Line ", fgRed, $(val.n + 1), fgYellow, " Program '", fgRed, val.program, fgYellow, "' Content '", fgRed, content, fgYellow, "'"

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
	while i.n < PROGRAM_REGISTER[i.program].split('\n').len:
		i.n += 1
	    if i.n >= PROGRAM_REGISTER[i.program].split('\n').len: continue
		var line = PROGRAM_REGISTER[i.program].split('\n')[i.n]

		line = line.replace("\\#", "__TAG__").split('#')[0].replace("__TAG__", "#")
		if line == "": continue
		trace.add(i)
		stack[stack.len - 1] = i

		if line.startsWith(':'):
			if stack.len > 1:
				discard stack.pop
				i = stack[stack.len - 1]
				i.n -= 1

				continue

			var name = line.substr(1).split(' ')[0]
			registry[name] = i

			if name != "main":
				i.n += 1
				while i.n < PROGRAM_REGISTER[i.program].split('\n').len and (not PROGRAM_REGISTER[i.program].split('\n')[i.n].startsWith(":main")):
					if PROGRAM_REGISTER[i.program].split('\n')[i.n].startsWith(":"):
						var name = PROGRAM_REGISTER[i.program].split('\n')[i.n].substr(1).split(' ')[0]
						registry[name] = i
					i.n += 1
					# if i.n >= PROGRAM_REGISTER[i.program].split('\n').len: break
			continue

		if line.startsWith("str::"):
			var name = line.substr(5).split(' ')[0]
			# try:
			    # discard parseFloat(name)
				# SetFailure(fmt"Variable name cannot be an integer constant at line {i.n + 1}")
				# return Return(
				# 	stackTrace: concat(trace, @[Trace(n: -1,
				#         program: "CRITICAL")]),
				# 	registry: registry,
				# 	num_memory: num_memory,
				# 	str_memory: str_memory
				# )
			# except CatchableError:
			
			var space = line.findAll(re"[ \t]+")
			if space.len == 0:
				str_memory[name] = ""
				continue
			
			var args = line.substr(name.len + space[0].len + 5)
	    	str_memory[name] = args.replace("\\n", "\n")
	    	continue

		elif line.startsWith("num::"):
			var name = line.substr(5).split(' ')[0]
			try:
			    discard parseFloat(name)
			    SetFailure(fmt"Variable name cannot be an integer constant at line {i.n + 1}")
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
    				SetFailure(fmt"Couldn't convert '{line.substr(name.len + space + 5)}' to number at line {i.n + 1}")
	    			return Return(
		    			stackTrace: concat(trace, @[Trace(n: -1,
			    				program: "CRITICAL")]),
				    	registry: registry,
    					num_memory: num_memory,
	    				str_memory: str_memory
		    		)

		var command = line.split(re"[ \t]+")[0]
		var space = 0
		var args = ""

		if line.findAll(re"[ \t]+").len == 0:
			space = 0
			args = ""
		else:
			space = line.findAll(re"[ \t]+")[0].len
			args = line.substr(command.len + space)

		var internals: Internals = initTable[string, Action]()

		mod_default_free()
		mod_default_exit()
		mod_default_goto()
		mod_default_branch()
		mod_default_comment()

		mod_io_dump()
		mod_io_echo()
		mod_io_read()
		mod_io_sleep()

		mod_modules_mod()
		mod_modules_eval()
		mod_modules_register()

		mod_operations_math()
		mod_operations_d_string()
		mod_operations_conditions()

		mod_fs()

		# deprecated replace mechanism
		# command = command.replace('.', '_')
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
				return
			elif returnValue == returnAction.EXIT:
				return Return(
					stackTrace: concat(trace, @[Trace(n: -1, program: "EXIT")]),
					registry: registry,
					num_memory: num_memory,
					str_memory: str_memory
				)
		elif database.hasKey command:
			var spl = args.split(' ')
			var call = database[command]

			if spl.len != call.argumentCount:
				SetFailure(fmt"Expected {call.argumentCount}, But got {spl.len} argument(s)")
				Inception(Return(
					stackTrace: trace,
					registry: registry,
					num_memory: num_memory,
					str_memory: str_memory
				))
				return

			var temp_str = str_memory
			var temp_num = num_memory

			for i in 0..spl.len:
				var arg = spl[i]
				if temp_str.hasKey arg: temp_str[fmt"a{i + 1}"] = temp_str[arg]
				elif temp_num.hasKey arg: temp_num[fmt"a{i + 1}"] = temp_num[arg]
			
			str_memory = temp_str
			num_memory = temp_num

			stack[stack.len - 1] = i
			stack.add(call.location)

			i = call.location
			i.n -= 1
			continue
		else:
			SetFailure(fmt"Couldn't spot internal function '{command}' at line {i.n + 1}")

			Inception(Return(
					stackTrace: trace,
					registry: registry,
					num_memory: num_memory,
					str_memory: str_memory
			))
			return

	return Return(
		stackTrace: trace,
		registry: registry,
		num_memory: num_memory,
		str_memory: str_memory
	)

proc populate_num(): NumberMemory =
	var table = initTable[string, float]()
	for i in 0..10000:
		var s: string = $(i)
		table[s] = i.float
	return table

proc populate_str(): StringMemory =
	var table = initTable[string, string]()

	# fill special characters
	table["\\n"] = "\n"
	table["\\r"] = "\r"
	table["\\0"] = "\0"

	return table

const DEVOLVE = "REVOLVER"

if DEVOLVE == "00000000":
	# compilation mode
	echo "Bundled egg"

proc help() =
	echo "Egg interpeter - v" & VERSION
	# echo "Usage:"
	# THESE GUYS ARE TAB INDENTED!!
	echo "	egg help			| Shows this panel."
	echo "	egg repl			| Opens a REPL interface."
	echo "	egg builtin 		| Dumps the builtin egg code of the interpreter."
	echo "	egg [files]		 | Executes the specified files." # this line has weird behavior...?!

# might be used later
# proc bar() = 
# 	const interval = 4
# 	for i in 0..100:
# 		stdout.styledWriteLine(fgRed, "0% ", fgWhite, '#'.repeat round(i / interval).int, if i > 50: fgGreen else: fgYellow, ' '.repeat(round((103 - i) / interval).int), $i , "%")
# 		sleep 20
# 		cursorUp 1
# 		eraseLine()

stdout.resetAttributes()

PROGRAM_REGISTER["__builtin__"] = """#> Builtin functions for the egg language.
:nothing #> Empty segment for branch cases.
:jmpt #> Jump if true
eval branch a1 %{a2} nothing #> Check a1 and if it is true, Jump to a2, Otherwise don't do anything

:jmpf #> Jump if false
eval branch a1 nothing %{a2} #> Check a1 and if it is false, Jump to a2, Otherwise don't do anything

:main
#> Register "nothing" command
str::nothing_prompt `nothing`\nDoes nothing.\nUseful for when you do not want to provide a case in the branch command!
reg nothing 0 nothing_prompt

#> Register "jmpt" command
str::jmpt_prompt `jmpt <condition> <branch_name>`\nJumps to the provided branch if the condition is true.
reg jmpt 2 jmpt_prompt

#> Register jmpf command
str::jmpf_prompt `jmpt <condition> <branch_name>`\nJumps to the provided branch if the condition is false.
reg jmpf 2 jmpf_prompt
"""

if paramCount() > 0:
    var cmd = paramStr(1)
    if cmd == "help":
        help()
	elif cmd == "repl":
		echo "Egg REPL - v" & VERSION
		echo "Input 'exit()' to exit, Or 'run()' to run all currently inputted code."
		echo "Input 'clear()' to clear all input code until now."
		echo "Keep in mind these commands are exclusive to the REPL, And not available in the interpreter itself."

		var code: seq[string] = @[]

		var registry = initTable[string, Trace]()
	    var num_memory = populate_num()
	    var str_memory = populate_str()

		# save and execute builtin
    	var ret = PROGRAM_REGISTER["__builtin__"].egg("__builtin__", registry, num_memory, str_memory)
    
    	registry = ret.registry
    	num_memory = ret.num_memory
    	str_memory = ret.str_memory

		while true:
			var input = ""

			try:
				stdout.write "> "
				input = readLine(stdin)
			except CatchableError:
				echo "Use 'exit()' to exit the REPL properly."
				break

			if input == "exit()":
				echo "Exiting REPL..."
				break
			elif input == "run()":
				PROGRAM_REGISTER["repl"] = code.join("\n")
    			var ret = egg(code.join("\n"), "repl", registry, num_memory, str_memory)

    			registry = ret.registry
    			num_memory = ret.num_memory
    			str_memory = ret.str_memory
			elif input == "clear()":
				echo "Cleaned current code buffer."
				code = @[]
			else:
				code.add input
    elif cmd == "compile":
		# to be implemented!
		discard
	elif cmd == "builtin":
		echo PROGRAM_REGISTER["__builtin__"]
	else:
		var registry = initTable[string, Trace]()
	    var num_memory = populate_num()
	    var str_memory = populate_str()

		# save and execute builtin
    	var ret = PROGRAM_REGISTER["__builtin__"].egg("__builtin__", registry, num_memory, str_memory)
    
    	registry = ret.registry
    	num_memory = ret.num_memory
    	str_memory = ret.str_memory

		# execute input files
    	for i in 1..paramCount():
    		var name = paramStr(i)
			var file = ""
    		try:
				file = readFile(name)
			except CatchableError:
				echo fmt"Couldn't find file {name}!"
				break

    		PROGRAM_REGISTER[name] = file
    		var ret = file.egg(name, registry, num_memory, str_memory)
    
    		registry = ret.registry
    		num_memory = ret.num_memory
    		str_memory = ret.str_memory
else:
    help()
