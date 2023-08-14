#? replace(sub = "\t", by = "    ")

import std/strformat
import std/strutils
import std/sequtils
import std/tables

import os

type returnAction = enum
	PEACEFUL = 0,
	CONTINUE = 1,
	EXIT = 2,
	CRITICAL = 3

type Trace = object
	n: int
	program: string

type Registry = Table[string, int]
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

	e.msg = "Critical exit from internal command"
	raise e

proc egg(code: string, filename: string, registry: var Registry,
		num_memory: var NumberMemory, str_memory: var StringMemory): Return =
	var stack: seq[int] = @[]
	var trace: seq[Trace] = @[]
	var lines = code.split('\n')

	var i = 0

	stack.add(i)
	while i < lines.len:
		var line = lines[i]

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
				i += 1
				while not lines[i].startsWith(":main"):
					if lines[i].startsWith(":"):
						var name = lines[i].substr(1).split(' ')[0]
						registry[name] = i
					i += 1
			continue

		trace.add(Trace(n: i + 1, program: filename))

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
			except:
				echo fmt"CRITICAL FAILURE: Couldn't convert '{line.substr(name.len + 6)}' to number at line {i + 1}!"
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
					i + 1)
			var falseCase = (
				if registry.hasKey(args.split(' ')[2]):
					registry[args.split(' ')[2]]
				else:
					i + 1)
				
			if addcond.isEmptyOrWhitespace:
				echo fmt"CRITICAL FAILURE: Condition memory address at line {i + 1} not provided!"
				return returnAction.CRITICAL
			elif trueCase == i + 1:
				echo fmt"CRITICAL FAILURE: True case memory address at line {i + 1} not provided!"
				return returnAction.CRITICAL
			elif falseCase == i + 1:
				echo fmt"CRITICAL FAILURE: False case memory address at line {i + 1} not provided!"
				return returnAction.CRITICAL
				
			var condition: bool
			if str_memory.hasKey(addcond):
				condition = (str_memory[addcond] == "" or str_memory[addcond] == "false")
			elif num_memory.hasKey(addcond):
				condition = num_memory[addcond] != 0
			else:
				echo fmt"CRITICAL FAILURE: Condition memory address at line {i + 1} was not found in memory!"
				return returnAction.CRITICAL
			
			
		
		internals["branch"] = branch

		#[
			--------------------------------------------------------------------
			File: mod/default/exit.nim
			-------------------------------------------------------------------- 
		]#

		#[
			--------------------------------------------------------------------
			File: mod/default/goto.nim
			-------------------------------------------------------------------- 
		]#

		#[
			--------------------------------------------------------------------
			File: mod/io/echo.nim
			-------------------------------------------------------------------- 
		]#

		#[
			--------------------------------------------------------------------
			File: mod/io/fmt.nim
			-------------------------------------------------------------------- 
		]#

		#[
			--------------------------------------------------------------------
			File: mod/modules/mod.nim
			-------------------------------------------------------------------- 
		]#

		#[
			--------------------------------------------------------------------
			File: mod/operations/math.nim
			-------------------------------------------------------------------- 
		]#

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
			echo fmt"CRITICAL FAILURE: Couldn't spot internal function '{command}' at line {i + 1}!"

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

if paramCount() > 0:

	var registry = initTable[string, int]()
	var num_memory = initTable[string, float]()
	var str_memory = initTable[string, string]()

	for i in 0..paramCount():
		var name = paramStr(i)
		var file = readFile(name)
		var ret = file.egg(name, registry, num_memory, str_memory)

		registry = ret.registry
		num_memory = ret.num_memory
		str_memory = ret.str_memory
else:
	echo "- Usage:"
	echo "-		egg <file>"
	echo "-		egg <file> <file> ..."