#!/usr/bin/env node
const start_time = Date.now()

const node_path = process.argv[0]
const __filename = process.argv[1]
const args = process.argv.slice(2)

const sleep = async (t) => await new Promise(r => setTimeout(r, t))

console.clear()

const load_time = Date.now()

import { Chalk } from 'chalk'
const chalk = new Chalk()
process.stdout.write(chalk.bold.hex('#888')('Patience.'))
await sleep(250)
process.stdout.write(chalk.bold.hex('#888')('.'))
await sleep(250)
process.stdout.write(chalk.bold.hex('#888')('.'))
await sleep(250)

import * as fs from 'fs'
import { execSync as run } from 'child_process'

const patience_time = Date.now()

let root_path = run('npm root -g').toString().trim()
let local_path = process.cwd() + '/node_modules'

const path = `${fs.existsSync(root_path + '/@egg/egg/package.json') ? root_path : local_path}/@egg/egg/`
const Package = JSON.parse(fs.readFileSync(path + 'package.json', 'utf-8'))

const root_time = Date.now()

if (args.length === 0) {
	process.stdout.write('\r                                          ')
	const E_G_G = `
                        ████████
                      ██        ██
                    ██▒▒▒▒        ██
                  ██▒▒▒▒▒▒      ▒▒▒▒██
                  ██▒▒▒▒▒▒      ▒▒▒▒██
                ██  ▒▒▒▒        ▒▒▒▒▒▒██
                ██                ▒▒▒▒██
              ██▒▒      ▒▒▒▒▒▒          ██
              ██      ▒▒▒▒▒▒▒▒▒▒        ██
              ██      ▒▒▒▒▒▒▒▒▒▒    ▒▒▒▒██
              ██▒▒▒▒  ▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒██
                ██▒▒▒▒  ▒▒▒▒▒▒    ▒▒▒▒██
                ██▒▒▒▒            ▒▒▒▒██
                  ██▒▒              ██
                    ████        ████
                        ████████
`.replaceAll('█', chalk.redBright.bold('█')).replaceAll(`▒`, chalk.green(`█`)).split('\n')
	for (let i = 0; i < E_G_G.length; i++) {
		await sleep(50 * (Math.random() * (Math.random() > 0.3 ? 3 : 7)))
		console.log(E_G_G[i])
	}
	const egg_time = Date.now()
	await sleep(500)

	console.log(`${chalk.italic.hex('#888')('@egg/')}${chalk.yellowBright.bold('egg')}` +
		` - ${chalk.magentaBright('v')}${chalk.magentaBright.bold(Package.version)}`)
	console.log(chalk.whiteBright(`A ${chalk.greenBright.bold('fast')}, ${chalk.greenBright.bold('reliable')}` +
		` and ${chalk.greenBright.bold('dead simple')} programming language.`))
	await sleep(500)
	console.log(chalk.whiteBright(` _________________________________
${chalk.bgHex(`#000`)(`|  _____________________________  |`)}`).replaceAll(/(\| \|)|(_  \|)|(\|  _)|(\|)|(_+)/g, (e) => chalk.greenBright.bold(e)))
	console.log(chalk.bgHex(`#000`).whiteBright(`| |                             | |
| | ${chalk.hex(`#999`)(`:`)}${chalk.bold.hex(`#5cfcff`)(`main`)}                       | |
| | ${chalk.redBright.bold(`str::`)}${chalk.hex('#888')(`welcome`)} ${chalk.bold.hex(`#f59e42`)(`Hello World!`)}   | |
| |                             | |
| | ${chalk.blueBright.bold(`echo`)} ${chalk.hex('#888')(`welcome`)}                | |
| |_____________________________| |
|_________________________________|\n`).replaceAll(/(\| \|)|(_  \|)|(\|  _)|(\|)|(_+)/g, (e) => chalk.greenBright.bold(e)))

	const program_time = Date.now()

	await sleep(100)
	console.log(chalk.cyanBright.bold('❯ ') + chalk.greenBright.italic.bold('Saved to ' + chalk.bgBlueBright.bold('program.egg') + '.'))
	await sleep(250)
	console.log(chalk.greenBright.bold('#') + ` ${chalk.yellowBright.bold(`egg`)} ${chalk.hex('#888')(`program.egg`)}`)
	const delay = Math.floor(Math.random() * 100) / 100 + .3
	const percentage = Math.floor(Math.random() * .5) + .5
	const before = delay * percentage
	const after = delay - before

	await sleep(before * 1000)
	console.log(chalk.bold.hex(`#f59e42`)('Hello World!'))
	await sleep(after * 1000)
	console.log(chalk.bold.hex('#888')('$ Finished in ' + delay.toString().substring(0, 4) + 's.'))

	const finish_time = Date.now()

	console.log(chalk.bold.hex('#888')(`
$ Internal load time: ${load_time - start_time}ms
$ External load time: ${patience_time - load_time}ms
$ Configuration time: ${root_time - patience_time}ms
$ Total time elapsed: ${finish_time - start_time}ms`))

	console.log()
	console.log()
} else {

}

export { }