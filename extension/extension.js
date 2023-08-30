const vscode = require('vscode')
const fs = require('fs')

let diagnostics
let channel

let register_descs = {}

function processDiagnostics() {
    if (vscode.window.activeTextEditor.document.languageId !== 'egg') return []
    const config = vscode.workspace.getConfiguration('egg-server')
    const url = config.get('ParserURL') === '//default//' ? (__dirname + '/egglsp.js') : config.get('ParserURL')

    if (fs.existsSync(url)) {
        // channel.appendLine('Trigerred change, Parser URL: ' + url)
        const text = fs.readFileSync(url, 'utf-8').replace('const vscode = require(\'vscode\')', '')
        const parser = eval(`const module = { exports: {} };; ${text};; module.exports`)
        // channel.appendLine('Parser version: ' + parser.version)

        const document = vscode.window.activeTextEditor.document
        const output = parser.lsp(document)
        let o = []

        for (let item of output.diag) {
            const range = new vscode.Range(
                new vscode.Position(item.position.start.line, item.position.start.character),
                new vscode.Position(item.position.end.line, item.position.end.character)
            )

            o.push(new vscode.Diagnostic(range, item.message, item.type))
        }

        register_descs = { ...register_descs, ...output.reg }
        const dec = vscode.window.createTextEditorDecorationType({
            color: '#66ff75'
        })

        let txt = document.getText()
        for(let x of Object.keys(register_descs)) {
            let val = register_descs[x]
            
            while(txt.indexOf(val.reg) > -1) {
                let line = txt.substring(0, txt.indexOf(val.reg)).split('\n').length
                if(txt[txt.indexOf(val.reg) - 1] === '\n')
                    vscode.window.activeTextEditor.setDecorations(dec, [
                        new vscode.Range(
                            new vscode.Position(line, 0),
                            new vscode.Position(line, val.reg.length))
                        ])
            }
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

    vscode.commands.registerCommand('egg-server.Check', async () => {
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
        let cmd = document.getText(document.getWordRangeAtPosition(pos, /([A-Za-z_]|_|\.|:)+/g)).split('\n')[0].split(' ')[0]
        line = line.replace(/^( |\t)*/g, '')
        cmd = cmd.replace(/^( |\t)*/g, '')

        if (line.startsWith('#>')) return { contents: ["This line is a documentation comment."] }
        if (line.startsWith('#')) return { contents: [] }
        channel.appendLine("Hover server called '" + cmd + "'")

        if (line.startsWith(cmd)) {
            let tooltip = '`#> This command is not a valid egg command, Maybe a typo...?`\nUnknown keyword or command...'

            const math_op = (cs, op) => {
                tooltip = cs.map(e => '`' + e + ' <destination> <first_number> <second_number>`').join('\n') + '\nFetches two numbers from memory, ' + op + ', And puts the result into the provided destination address.'
            }

            const cond_op = (cs, op) => {
                tooltip = cs.map(e => '`' + e + ' <destination> <first_value> <second_value>`').join('\n') + '\nFetches two values from memory, ' + op + ', And puts the result into the provided destination address.'
            }

            if (cmd.startsWith(':')) tooltip = '`:<segment>`\nCreates a segment with the name \'' + cmd.substring(1) + '\'.'


            else if (cmd.startsWith('str::')) tooltip = '`str::<name> <value>`\nPuts a string value into memory as the name \'' + cmd.substring(5) + '\'.'
            else if (cmd.startsWith('num::')) tooltip = '`num::<name> <value>`\nPuts a float value into memory as the name \'' + cmd.substring(5) + '\'.'
            else if (cmd === '#') tooltip = '`# <comment>`\nA single-line comment.'


            else if (cmd === 'free') tooltip = '`free <name>`\nFrees a value from memory.'
            else if (cmd === 'branch' || cmd === 'if') tooltip = '`branch <condition_name> <true_case?> <false_case?>`\n`if <condition_name> <true_case?> <false_case?>`\nChecks if a variable in memory is true. If true, The true_case segment is ran. Otherwise, The false_case segment is ran.'
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
            else if (cmd === 'reg' || cmd === 'register') tooltip = '`reg <name> <argument_count> <description>`\n`register <name> <argument_count> <description>`\nRegisters a segment as a command.'

            else if (['add'].includes(cmd)) math_op(['add'], 'Adds them together')
            else if (['subtract', 'sub'].includes(cmd)) math_op(['subtract', 'sub'], 'Subtracts the second from the first')
            else if (['multiply', 'mul'].includes(cmd)) math_op(['multiply', 'mul'], 'Multiplies them')
            else if (['divide', 'div'].includes(cmd)) math_op(['divide', 'div'], 'Divides the first by the second')
            else if (['power', 'pow'].includes(cmd)) math_op(['power', 'pow'], 'Raises the first to the second number\'s exponent')


            else if (cmd === 'string.index') tooltip = '`string.index <index> <string> <destination>`\nGets the nth character from the provided string and places it in the destination in string memory.'
            else if (cmd === 'string.split') tooltip = '`string.split <separator> <string> <index> <destination>`\nReads the given string from memory, Splits it by the said separator, And places the nth string from the array into the said destination.'
            else if (cmd === 'string.append') tooltip = '`string.append <destination> <left_string> <right_string>`\nAppends two strings from memory together and stores the result in the provided destination.'

            else if (cmd === 'fs.read') tooltip = '`fs.read <filename_variable> <destination>`\nReads a file from the filesystem and puts the content in a variable.'
            else if (cmd === 'fs.write') tooltip = '`fs.write <filename_variable> <data_variable>`\nWrites the contents of the specified variable to a file in the filesystem.'


            else if (['equals'].includes(cmd)) cond_op(['equals'], 'Returns true if the two values are equal')

            else if (['and'].includes(cmd)) cond_op(['and'], 'Returns true if both values are true')
            else if (['or'].includes(cmd)) cond_op(['or'], 'Returns true if one of the values is true')

            else if (['not'].includes(cmd)) tooltip = ['not'].map(e => '`' + e + ' <destination> <value>`').join('\n') + '\nFetches value from memory, Negates the value, And puts the result into the provided destination address.'

            else if (['morethan', 'more'].includes(cmd)) cond_op(['morethan', 'more'], 'Returns true if the first value is more than the second')
            else if (['lessthan', 'less'].includes(cmd)) cond_op(['lessthan', 'less'], 'Returns true if the first value is less than the second')

            else if (['morequals', 'meq'].includes(cmd)) cond_op(['morequals', 'meq'], 'Returns true if the first value is more than or equals to the second')
            else if (['lessequals', 'leq'].includes(cmd)) cond_op(['lessquals', 'leq'], 'Returns true if the first value is less than or equals to the second')

            else if (register_descs[cmd]) tooltip = register_descs[cmd].desc + '\n\n***This command is registered by a 3rd party.***'

            //@ts-ignore
            tooltip = tooltip.split('\n').map(e => `- ${e}`).join('\n').replaceAll(/- `[^`]+`/g, (g) => `\`\`\`egg\n${g.substring(3, g.length - 1)}\n\`\`\``).replaceAll('```\n```egg\n', '\n').replaceAll(/\n{2,}/g, '\n')

            const header = `## ${cmd}`
            let code = (tooltip.match(/```egg\n([^`]|\n)+\n```/g) ?? [''])[0]

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