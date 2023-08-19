//@ts-check
import * as code from 'vscode'

function activate() {
    console.log('hi')
    code.languages.registerHoverProvider('egg', {
        provideHover(document, pos, token) {
            return {
                contents: ['Hello World!']
            }
        }
    })
}

activate()