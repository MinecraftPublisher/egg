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
			var args = line.substr(name.len + 6)

			str_memory[name] = args

			continue

		if line.startsWith("num::"):
			var name = line.substr(5).split(' ')[0]

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

        #[
            --------------------------------------------------------------------
            File: mod/default/comment.nim
            --------------------------------------------------------------------
        ]#

        proc comment(): returnAction =
            return returnAction.PEACEFUL

        internals["comment"] = comment
        internals["#"] = comment

        #[
            --------------------------------------------------------------------
            File: mod/default/free.nim
            --------------------------------------------------------------------
        ]#

        proc free(): returnAction =
            num_memory.del(args)
            str_memory.del(args)
            return returnAction.PEACEFUL

        internals["free"] = free

		#[
			--------------------------------------------------------------------
			File: mod/default/branch.nim
			-------------------------------------------------------------------- 
		]#

		#:branch
		proc branch(): returnAction =
    		var addcond = args.split(' ')[0]
			var trueCase = (
				if registry.hasKey(args.split(' ')[1]):
					registry[args.split(' ')[1]]
				else:
					i)
			var falseCase = (
				if registry.hasKey(args.split(' ')[2]):
					registry[args.split(' ')[2]]
				else:
					i)
				
			if addcond.isEmptyOrWhitespace:
				echo fmt"CRITICAL FAILURE: Condition memory address at line {i.n + 1} not provided!"
				return returnAction.CRITICAL
			elif trueCase.n == i.n + 1:
				echo fmt"CRITICAL FAILURE: True case memory address at line {i.n + 1} not provided!"
				return returnAction.CRITICAL
			elif falseCase.n == i.n + 1:
				echo fmt"CRITICAL FAILURE: False case memory address at line {i.n + 1} not provided!"
				return returnAction.CRITICAL
				
			var condition: bool
			if str_memory.hasKey(addcond):
				condition = (str_memory[addcond] == "" or str_memory[addcond] == "false")
			elif num_memory.hasKey(addcond):
				condition = num_memory[addcond] != 0
			else:
				echo fmt"CRITICAL FAILURE: Condition memory address at line {i.n + 1} was not found in memory!"
				return returnAction.CRITICAL

			if condition:
				stack[stack.len - 1] = i
				stack.add(trueCase)
				i = trueCase
				# i.n += 1
				return returnAction.CONTINUE
			else:
				stack[stack.len - 1] = i
				stack.add(falseCase)
				i = falseCase
				# i.n += 1
				return returnAction.CONTINUE
		
		internals["branch"] = branch
		internals["if"] = branch

		#[
			--------------------------------------------------------------------
			File: mod/default/exit.nim
			-------------------------------------------------------------------- 
		]#

		#:exit
		proc exit(): returnAction =
			return returnAction.EXIT

		internals["exit"] = exit

		#[
			--------------------------------------------------------------------
			File: mod/default/goto.nim
			-------------------------------------------------------------------- 
		]#

		#:goto
		proc goto(): returnAction =
			var segment = args.split(' ')[0]
			if(not registry.hasKey(segment) and registry[segment].n != 0):
				echo fmt"CRITICAL FAILURE: Couldn't find segment '{segment}' to run goto at line {i.n + 1}!"
				return returnAction.CRITICAL

			stack[stack.len - 1].n = i.n + 1
			stack.add(registry[segment])

			i = registry[segment]
			return returnAction.PEACEFUL

		internals["goto"] = goto

		#[
			--------------------------------------------------------------------
			File: mod/io/dump.nim
			-------------------------------------------------------------------- 
		]#

		#:fmt
		proc dump(): returnAction =
			if str_memory.hasKey(args.split(' ')[0]): 
				echo str_memory[args.split(' ')[0]] 
			elif num_memory.hasKey(args.split(' ')[0]):
			    echo num_memory[args.split(' ')[0]]
			else:
				echo "(null)"
			
			return returnAction.PEACEFUL

		internals["dump"] = dump
		#[
			--------------------------------------------------------------------
			File: mod/io/echo.nim
			-------------------------------------------------------------------- 
		]#

		#:echo
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

		#[
			--------------------------------------------------------------------
			File: mod/io/read.nim
			--------------------------------------------------------------------
		]#

		proc read(): returnAction =
		    var l = readLine(stdin)
		    var target = args

		    str_memory[target] = l

		internals["read"] = read

        #[
            --------------------------------------------------------------------
            File: mod/io/sleep.nim
            --------------------------------------------------------------------
        ]#

        proc d_sleep(): returnAction =
            try:
                var t = parseFloat(args)
                sleep(t.int)
                return returnAction.PEACEFUL
            except CatchableError:
                echo fmt"CRITICAL FAILURE: Invalid float provided for sleep duration at line {i.n + 1}!"
                return returnAction.CRITICAL

        internals["sleep"] = d_sleep

		#[
			--------------------------------------------------------------------
			File: mod/modules/mod.nim
			-------------------------------------------------------------------- 
		]#

		const BUILTIN: Table[string, string] = {
			"test": "echo This is a test module."
		}.toTable

		proc d_mod(): returnAction =
			proc getDir(path = "./", depth = 0): string =
				if dirExists(path) and depth < 5:
					if dirExists(path & ".egg"):
						return path & ".egg/"
					else:
						return getDir(path & "../", depth + 1)
				else:
					return ""
			
			var eggpath = getDir()

			if args.endsWith(".egg") and (args.startswith("./") or args.startsWith("../") or args.startsWith("/")):
				if not fileExists(args):
					echo fmt"CRITICAL FAILURE: Couldn't find file '{args}' in filesystem to import at line {i.n + 1}!"
					return returnAction.CRITICAL

                PROGRAM_REGISTER[filename & " > " & args] = readFile(args)
				var evalresult = egg(readFile(args), filename & " > " & args, registry, num_memory, str_memory)
				trace = concat(trace, evalresult.stackTrace)
				registry = evalresult.registry
				str_memory = evalresult.str_memory
				num_memory = evalresult.num_memory
				
				return returnAction.PEACEFUL
			elif BUILTIN.hasKey args:
			    PROGRAM_REGISTER[filename & " > " & args] = BUILTIN[args]
				var evalresult = egg(BUILTIN[args], args & " > " & args, registry, num_memory, str_memory)
				trace = concat(trace, evalresult.stackTrace)
				registry = evalresult.registry
				str_memory = evalresult.str_memory
				num_memory = evalresult.num_memory

				return returnAction.PEACEFUL
			else:
				if fileExists(eggpath & args & ".egg"):
				    PROGRAM_REGISTER[filename & " > " & args & ".egg"] = readFile(eggpath & args & ".egg")
					var evalresult = egg(readFile(eggpath & args & ".egg"), filename & " > " & args & ".egg", registry, num_memory, str_memory)
					trace = concat(trace, evalresult.stackTrace)
					registry = evalresult.registry
					str_memory = evalresult.str_memory
					num_memory = evalresult.num_memory
				
					return returnAction.PEACEFUL
				else:
					echo fmt"CRITICAL FAILURE: Couldn't find package '{args}' in internal package repository or the registry to import at line {i.n + 1}! (detected package directory: {eggpath})"
					return returnAction.CRITICAL
		
		internals["mod"] = d_mod
		
		#[
			--------------------------------------------------------------------
			File: mod/operations/math.nim
			-------------------------------------------------------------------- 
		]#

		proc op(handler: (float, float) -> float): returnAction =
		    var spl = args.split(' ')
		    if spl.len < 1:
		        echo fmt"CRITICAL FAILURE: Memory address for destination not provided at line {i.n + 1}!"
		        return returnAction.CRITICAL
		    if spl.len < 2:
		        echo fmt"CRITICAL FAILURE: Memory address for first integer not provided at line {i.n + 1}"
		        return returnAction.CRITICAL
		    if spl.len < 3:
		        echo fmt"CRITICAL FAILURE: Memory address for second integer not provided at line {i.n + 1}"
		        return returnAction.CRITICAL
		    
			var adr1 = spl[1]
			var adr2 = spl[2]
			var dest = spl[0]

			if not num_memory.hasKey adr1:
				echo fmt"CRITICAL FAILURE: Cannot find number {adr1} in memory at line {i.n + 1}!"
				return returnAction.CRITICAL
			elif not num_memory.hasKey adr2:
				echo fmt"CRITICAL FAILURE: Cannot find number {adr2} in memory at line {i.n + 1}!"
				return returnAction.CRITICAL
			else:
				var num1 = num_memory[adr1]
				var num2 = num_memory[adr2]

				num_memory[dest] = handler(num1, num2)
				return returnAction.PEACEFUL
		
		proc add(): returnAction =
			return op((a, b) => a + b)

		internals["add"] = add
		internals["+"] = add

		proc subtract(): returnAction =
			return op((a, b) => a - b)

		internals["subtract"] = subtract
		internals["-"] = subtract

		proc multiply(): returnAction =
			return op((a, b) => a * b)

		internals["multiply"] = multiply
		internals["*"] = multiply

		proc divide(): returnAction =
			return op((a, b) => a / b)

		internals["divide"] = divide
		internals["/"] = divide

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
