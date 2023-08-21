const vscode = require('vscode')
const fs = require('fs')

let diagnostics
let channel

function processDiagnostics() {
    const config = vscode.workspace.getConfiguration('egg-server')
    const url = config.get('ParserURL') === '//default//' ? (__dirname + '/egglsp.js') : config.get('ParserURL')

    if(fs.existsSync(url)) {
        // channel.appendLine('Trigerred change, Parser URL: ' + url)
        const text = fs.readFileSync(url, 'utf-8').replace('const vscode = require(\'vscode\')', '')
        const parser = eval(`const module = { exports: {} };; ${text};; module.exports`)
        // channel.appendLine('Parser version: ' + parser.version)
    
        const document = vscode.window.activeTextEditor.document
        const output = parser.lsp(document)
        let o = []
    
        for (let item of output) {
            const range = new vscode.Range(
                new vscode.Position(item.position.start.line, item.position.start.character),
                new vscode.Position(item.position.end.line, item.position.end.character)
            )
    
            o.push(new vscode.Diagnostic(range, item.message, item.type))
        }
    
        return o
    } else {
        vscode.window.showWarningMessage('Could not find language server for egg.')
        return []
    }
}

/** @param {vscode.ExtensionContext} context */
function activate(context) {
    channel = vscode.window.createOutputChannel("Egg")
    channel.appendLine("Extension activated")

    diagnostics = vscode.languages.createDiagnosticCollection('egg')

    context.subscriptions.push(diagnostics)
    vscode.workspace.onDidChangeTextDocument((e) => {
        if (e) {
            let diagnosis = processDiagnostics()

            diagnostics.set(vscode.window.activeTextEditor.document.uri, diagnosis)
        }
    })

    vscode.commands.registerCommand('egg-server.Check', () => {
        vscode.window.showInformationMessage('Checking document...')
        let diagnosis = processDiagnostics()

        diagnostics.set(vscode.window.activeTextEditor.document.uri, diagnosis)
    })

    let diagnosis = processDiagnostics()

    diagnostics.set(vscode.window.activeTextEditor.document.uri, diagnosis)

    /**
     * 
     * @param {vscode.TextDocument} document 
     * @param {vscode.Position} pos 
     * @param {vscode.CancellationToken} token 
     * @returns 
     */
    function provideHover(document, pos, token) {
        let line = document.getText(new vscode.Range(document.lineAt(pos.line).range.start, document.lineAt(document.lineCount - 1).range.end))
        let cmd = document.getText(document.getWordRangeAtPosition(pos, /([A-Za-z]|\.|:|[*+-/])+/g)).split('\n')[0].split(' ')[0]

        if (line.startsWith('#>')) return { contents: ["This line is a documentation comment."] }
        if (line.startsWith('#')) return { contents: [] }
        channel.appendLine("Hover server called '" + cmd + "'")

        if (line.startsWith(cmd)) {
            let tooltip = '`#> This command is not a valid egg command, Maybe a typo...?`\nUnknown keyword or command...'

            const math_op = (cs, op) => {
                tooltip = cs.map(e => '`' + e + ' <destination> <first_number> <second_number>`').join('\n') + '\nFetches two numbers from memory, ' + op + ', And puts the result into the provided destination address.'
            }

            if (cmd.startsWith(':')) tooltip = '`:<segment>`\nCreates a segment with the name \'' + cmd.substring(1) + '\'.'


            else if (cmd.startsWith('str::')) tooltip = '`str::<name> <value>`\nPuts a string value into memory as the name \'' + cmd.substring(5) + '\'.'
            else if (cmd.startsWith('num::')) tooltip = '`num::<name> <value>`\nPuts a float value into memory as the name \'' + cmd.substring(5) + '\'.'
            else if (cmd === '#') tooltip = '`# <comment>`\nA single-line comment.'


            else if (cmd === 'free') tooltip = '`free <name>`\nFrees a value from memory.'
            else if (cmd === 'branch') tooltip = '`branch <condition_name> <true_case?> <false_case?>`\nChecks if a variable in memory is true. If true, The true_case segment is ran. Otherwise, The false_case segment is ran.'
            else if (cmd === 'exit') tooltip = '`exit`\nImmediately exits the program.'
            else if (cmd === 'goto') tooltip = '`goto <segment>`\nPushes current location to the stack and immediately executes the next line of the provided segment.'
            else if (cmd === 'dump') tooltip = '`dump <name>`\nDumps a variable value from memory to console.'


            else if (cmd === 'echo') tooltip = '`echo <text>`\n`echo This is a %{variable} call.`\nPrints a formatted string to the console.'
            else if (cmd === 'printf') tooltip = '`printf <text>`\n`printf This is a %{variable} call.`\nPrints a formatted string to the console, Without creating a new line.'
            else if (cmd === 'read') tooltip = '`read <name>`\nReads a value from stdin (a line) and puts it into the said variable as a string.'
            else if (cmd === 'readnum' || cmd === 'numread') tooltip = '`readnum <name>`\n`numread <name>`\nReads a value from stdin (a line) and puts it into the said variable as a float.'
            else if (cmd === 'sleep') tooltip = '`sleep <milliseconds>`\nSleeps for the specified number of milliseconds.'


            else if (cmd === 'mod') tooltip = '`mod test`\n`mod ./test.egg`\nLoads an egg module and evaluates it.'
            else if (cmd === 'eval') tooltip = '`eval <egg_code>`\nEvaluates egg code given to it and replaces any formatted variable call with its respective value from memory.'


            else if (['add', '+'].includes(cmd)) math_op(['add', '+'], 'Adds them together')
            else if (['subtract', 'sub', '-'].includes(cmd)) math_op(['subtract', 'sub', '-'], 'Subtracts the second from the first')
            else if (['multiply', 'mul', '*'].includes(cmd)) math_op(['multiply', 'mul', '*'], 'Multiplies them')
            else if (['divide', 'div', '/'].includes(cmd)) math_op(['divide', 'div', '/'], 'Divides the first by the second')
            else if (['power', 'pow', '**'].includes(cmd)) math_op(['power', 'pow', '**'], 'Raises the first to the second number\'s exponent')


            else if (cmd === 'string.index') tooltip = '`string.index <index> <string> <destination>`\nGets the nth character from the provided string and places it in the destination in string memory.'
            else if (cmd === 'string.split') tooltip = '`string.split <separator> <string> <index> <destination>`\nReads the given string from memory, Splits it by the said separator, And places the nth string from the array into the said destination.'



            //@ts-ignore
            tooltip = tooltip.split('\n').map(e => `- ${e}`).join('\n').replaceAll(/- `[^`]+`/g, (g) => `\`\`\`egg\n${g.substring(3, g.length - 1)}\n\`\`\``).replaceAll('```\n```egg', '\n').replaceAll(/\n{2,}/g, '\n')

            const header = `## ${cmd}`
            let code = (tooltip.match(/```egg\n([^`]|\n)+\n```/g) ?? ['```egg\n\n```'])[0]

            //@ts-ignore
            code = code.substring(7, code.length - 4).replaceAll(/\n{2,}/g, '\n')

            //@ts-ignore
            tooltip = tooltip.replaceAll('```egg\n' + code + '\n```\n', '')

            return {
                contents: [
                    header,
                    {
                        language: 'egg',
                        value: code
                    },
                    tooltip
                ]
            }
        } else {
            return { contents: [] }
        }
    }

    vscode.languages.registerHoverProvider('egg', { provideHover })

    channel.appendLine('Registered hover server')
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}