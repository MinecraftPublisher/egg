const vscode = require('vscode')

/** @type {(document: vscode.TextDocument) => LSP[]}  */
module.exports = {
	version: 'beta1.0',
	lsp(document) {
		let __text = document.getText()
		const LSP_CHECK = ((text) => {
			let lines = text.split('\n')

			/** @type {LSP[]} */
			let diagnosis = []
			let segments = []

			let num_memory = {}
			let str_memory = {}

			let postcheck = []

			for (let i = 0; i < lines.length; i++) {
				let line = lines[i].trim()

				line = line.replace(/\\#/g, '__TAG__').split('#')[0].replace(/__TAG__/g, '#')
				if (line === '') continue

				/// Segment
				if (line.startsWith(':')) segments.push(line.substring(1))

				/// String
				if (line.startsWith('str::')) {
					let name = line.substring(5).split(' ')[0]
					let value = line.substring(5).split(' ').slice(1).join(' ')

					if (value === '') diagnosis.push({
						type: vscode.DiagnosticSeverity.Warning,
						message: 'Empty string \'' + name + '\'.',
						position: {
							start: { line: i, character: 0 },
							end: { line: i, character: line.length }
						}
					})

					else str_memory[name] = value
				}

				/// Number
				if (line.startsWith('num::')) {
					let name = line.substring(5).split(' ')[0]
					let value = line.substring(5).split(' ').slice(1).join(' ')

					if (value === '') diagnosis.push({
						type: vscode.DiagnosticSeverity.Error,
						message: 'Empty string \'' + name + '\'.',
						position: {
							start: { line: i, character: 0 },
							end: { line: i, character: line.length }
						}
					})

					else {
						if (isNaN(parseInt(value))) diagnosis.push({
							type: vscode.DiagnosticSeverity.Error,
							message: 'Invalid float \'' + value + '\'.',
							position: {
								start: { line: i, character: 0 },
								end: { line: i, character: line.length }
							}
						})

						num_memory[name] = parseFloat(value)
					}
				}

				/// Commands
				let command = line.split(/[ \t]+/g)[0]
				let space = (line.match(/[ \t]+/g) ?? [''])[0].length
				let args = line.substring(command.length + space)

				if (['add', 'subtract', 'multiply', 'divide', 'power', 'sub', 'mul', 'div', 'pow', '+', '-', '*', '/', '**'].includes(command)) {
					num_memory[args.split(' ')[0]] = 0
				}

				postcheck.push({
					i,
					line,
					command,
					space,
					args
				})
			}

			for (let check of postcheck) {
				let i = check.i
				let line = check.line

				let command = check.command
				let space = check.space
				let args = check.args

				if ((command === 'free' || command === 'dump') && !(args in str_memory) && !(args in num_memory)) diagnosis.push({
					type: vscode.DiagnosticSeverity.Error,
					message: 'Variable \'' + args + '\' not found.',
					position: {
						start: { line: i, character: command.length + space },
						end: { line: i, character: line.length }
					}
				})

				if (command === 'branch') {
					let condition = args.split(' ')[0]
					let trueCase = args.split(' ')[1]
					let falseCase = args.split(' ')[2]

					if (!(condition in str_memory) && !(condition in num_memory)) diagnosis.push({
						type: vscode.DiagnosticSeverity.Error,
						message: 'Cannot find variable \'' + condition + '\' in branch.',
						position: {
							start: { line: i, character: command.length + space },
							end: { line: i, character: command.length + space + condition.length }
						}
					})

					if (!segments.includes(trueCase)) diagnosis.push({
						type: vscode.DiagnosticSeverity.Error,
						message: 'Cannot find segment \'' + trueCase + '\' for true branch case.',
						position: {
							start: { line: i, character: command.length + space + condition.length + 1 },
							end: { line: i, character: command.length + space + condition.length + trueCase.length + 1 }
						}
					})

					if (!segments.includes(falseCase)) diagnosis.push({
						type: vscode.DiagnosticSeverity.Error,
						message: 'Cannot find segment \'' + falseCase + '\' for false branch case.',
						position: {
							start: { line: i, character: command.length + space + condition.length + trueCase.length + 2 },
							end: { line: i, character: command.length + space + condition.length + trueCase.length + falseCase.length + 2 }
						}
					})
				}

				else if (command === 'goto' && !segments.includes(args)) diagnosis.push({
					type: vscode.DiagnosticSeverity.Error,
					message: 'Cannot find segment \'' + args + '\' in goto.',
					position: {
						start: { line: i, character: command.length + space },
						end: { line: i, character: command.length + space + args.length }
					}
				})

				else if (command === 'echo' || command === 'printf') {
					let matches = args.match(/%{[^} ]+}/g) ?? []
					for(let match of matches) {
						let varname = match.substring(2, match.length - 1)
						if(!(varname in num_memory) && !(varname in str_memory)) diagnosis.push({
							type: vscode.DiagnosticSeverity.Error,
							message: 'Cannot find variable \'' + varname + '\' in ' + command + '.',
							position: {
								start: { line: i, character: line.indexOf(match) },
								end: { line: i, character: line.indexOf(match) + match.length }
							}
						})
					}
				}

				else if (command === 'sleep' && isNaN(parseFloat(args))) diagnosis.push({
					type: vscode.DiagnosticSeverity.Error,
					message: 'Invalid integer \'' + args + '\' in sleep.',
					position: {
						start: { line: i, character: command.length + space },
						end: { line: i, character: command.length + space + args.length }
					}
				})

				else if (command === 'mod') {
					//TODO IMPLEMENT MOD
				}

				else if (command === 'eval') {
					let matches = args.match(/%{[^} ]+}/g) ?? []
					for(let match of matches) {
						let varname = match.substring(2, match.length - 1)
						if(!(varname in num_memory) && !(varname in str_memory)) diagnosis.push({
							type: vscode.DiagnosticSeverity.Error,
							message: 'Cannot find variable \'' + varname + '\' in eval.',
							position: {
								start: { line: i, character: line.indexOf(match) },
								end: { line: i, character: line.indexOf(match) + match.length }
							}
						})
					}

					//! needs more implementation and pre-guessing to actually be able to check evals
					//// diagnosis.push(...LSP_CHECK(args))
				}

				else if (['add', 'subtract', 'multiply', 'divide', 'power', 'sub', 'mul', 'div', 'pow', '+', '-', '*', '/', '**'].includes(command)) {
					//! These commands require more implementations and pre-guessings to support eval since
					//! I still haven't set anything up to evaluate math expressions before runtime.
					//! Currently the LSP system just runs over the code and checks variables, Nothing else.

					let dest = args.split(' ')[0]
					let num1 = args.split(' ')[1]
					let num2 = args.split(' ')[2]

					if(!(dest in num_memory)) diagnosis.push({
						type: vscode.DiagnosticSeverity.Error,
						message: 'Cannot find variable \'' + dest + '\' in ' + command + '.',
						position: {
							start: { line: i, character: command.length + space },
							end: { line: i, character: command.length + space + dest.length }
						}
					})

					if (!(num1 in num_memory)) diagnosis.push({
						type: vscode.DiagnosticSeverity.Error,
						message: 'Cannot find variable \'' + dest + '\' for first number.',
						position: {
							start: { line: i, character: command.length + space + dest.length + 1 },
							end: { line: i, character: command.length + space + dest.length + num1.length + 1 }
						}
					})

					if (!(num2 in num_memory)) diagnosis.push({
						type: vscode.DiagnosticSeverity.Error,
						message: 'Cannot find variable \'' + num2 + '\' for second number.',
						position: {
							start: { line: i, character: command.length + space + dest.length + num1.length + 2 },
							end: { line: i, character: command.length + space + dest.length + num1.length + num2.length + 2 }
						}
					})
				}

				else if (command === 'string.index') {
					//TODO IMPLEMENT STRING INDEX
				}

				else if (command === 'string.split') {
					//TODO IMPLEMENT STRING SPLIT
				}
			}

			return diagnosis
		})

		return LSP_CHECK(__text)
	}
}