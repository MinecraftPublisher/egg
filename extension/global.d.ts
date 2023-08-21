interface LSP {
	type: vscode.DiagnosticSeverity
	message: string
	position: {
		start: {
			line: number
			character: number
		}
		end: {
			line: number
			character: number
		}
	}
}