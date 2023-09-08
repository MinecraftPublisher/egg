#!/usr/bin/env bun
const start_time = Date.now()

const node_path = process.argv[0]
const __filename = process.argv[1]
const args = process.argv.slice(2)

const sleep = async (t) => await new Promise(r => setTimeout(r, t))

console.clear()

const load_time = Date.now()

import * as fs from 'fs'
import { execSync as run } from 'child_process'

import { Chalk } from 'chalk'
const chalk = new Chalk()
process.stdout.write(chalk.bold.hex('#888')('Patience.'))
import * as ts from 'typescript'
process.stdout.write(chalk.bold.hex('#888')('.'))
const __factory = (await import('../build.ts')).default
__factory()
process.stdout.write(chalk.bold.hex('#888')('.'))
const built = `#!/usr/bin/env node
//@ts-nocheck

const node_path = process.argv[0]
const __filename = process.argv[1]
const args = process.argv.slice(2)

import { Chalk } from 'chalk'
const chalk = new Chalk()

import * as fs from 'fs'

let unknown = args.filter(e => !fs.existsSync(e))
let files = args.filter(e => fs.existsSync(e)).map(e => ({
	program: e,
	text: fs.readFileSync(e, 'utf-8')
}))

const egg_construct = (() => {
	${fs.readFileSync(__filename.replaceAll('/bin/index.ts', '/dist/egg.ts').replaceAll('/bin/fancy.ts', '/dist/egg.ts').replaceAll('\\', '\\\\'), 'utf-8').replaceAll('export default egg', 'return egg')}
})

if(args.length === 0) {
	console.log('Usage:\\n	egg [file_names_separated_by_spaces]\\n	egg minimal -> Switch back to fancy version\\n	egg sync -> Sync minimal version with the fancy builder')
} else if (args[0] === 'minimal') {
	console.log('Activating fancy mode...')
	const target = __filename
	fs.writeFileSync(target, fs.readFileSync(target, 'utf-8').replace('\\'bundle.js\\'', '\\'fancy.ts\\''))
	console.log('Done!')
} else if (args[0] === 'sync') {
	console.log('Syncing minimal mode...')
	await import(__filename.replaceAll('/index.ts', '/fancy.ts'))
	console.log('\\rDone!       ')
} else {
	const egg = egg_construct()

if(unknown.length > 0) {
	for(let missing of unknown) {
		console.log(chalk.redBright.bold('error') + ': Program \\'' + missing + '\\' does not exist!')
	}
} else {
	let eggData = {
		stackTrace: [],
		registry: {},
		num_memory: {},
		str_memory: {}
	}

	const start = performance.now()
	for(let program of files) {
		let result = await egg(program.text, program.program, eggData.registry, eggData.num_memory, eggData.str_memory)

		eggData.stackTrace.push(...result.stackTrace)
		eggData.registry = { ...eggData.registry, ...result.registry }
		eggData.num_memory = { ...eggData.num_memory, ...result.num_memory }
		eggData.str_memory = { ...eggData.str_memory, ...result.str_memory }
	}
	console.log(chalk.bold.hex('#888')('$ Took ' + Math.round((performance.now() - start) * 1000) / 1000 + 'ms.'))
}
}`

const program = ts.transpileModule(built, {
	fileName: 'bundle.js',
	moduleName: 'egg',
	compilerOptions: {
		module: ts.ModuleKind.ESNext,
		target: ts.ScriptTarget.Latest
	}
})

// fs.writeFileSync(__filename.replaceAll('/bin/index.ts', '/bin/bundle.ts'), built)
fs.writeFileSync(__filename.replaceAll('/bin/index.ts', '/bin/bundle.js').replaceAll('/bin/fancy.ts', '/bin/bundle.js'), program.outputText)

if (args[0] !== 'sync') {
	const egg = (await import('../dist/egg.ts')).default

	type Iregistry = { [key: string]: number }
	type InumberMemory = { [key: string]: number }
	type IstringMemory = { [key: string]: string }

	interface IeggReturn {
		stackTrace: { n: number, program: string }[]
		registry: Iregistry
		num_memory: InumberMemory
		str_memory: IstringMemory
	}

	const patience_time = Date.now()

	let root_path = run('npm root -g').toString().trim()
	let local_path = process.cwd() + '/node_modules'

	let impatient = true

	const path = `${fs.existsSync(root_path + '/@agent_z/egg/package.json') ? root_path : local_path}/@agent_z/egg/`
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

		console.log(`${chalk.italic.hex('#888')('@agent_z/')}${chalk.yellowBright.bold('egg')}` +
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
$ Total time elapsed: ${finish_time - start_time}ms
! To enable minimal mode and decrease loading and interpretation time, Run \`egg minimal\`. 
!!	(Requires fancy version to be ran atleast once)`))

		console.log()
		console.log()
	} else if (args[0] === 'minimal') {
		console.log('\rActivating minimal mode...')
		const target = __filename
		fs.writeFileSync(target, fs.readFileSync(target, 'utf-8').replace('\'fancy.ts\'', '\'bundle.js\''))
		console.log('Done!')
	} else {
		let unknown = args.filter(e => !fs.existsSync(e))
		let files = args.filter(e => fs.existsSync(e)).map(e => ({
			program: e,
			text: fs.readFileSync(e, 'utf-8')
		}))

		if (unknown.length > 0) {
			for (let missing of unknown) {
				console.log(chalk.redBright.bold('error') + ': Program \'' + missing + '\' does not exist!')
			}
		} else {
			process.stdout.write('\r')

			let eggData: IeggReturn = {
				stackTrace: [],
				registry: {},
				num_memory: {},
				str_memory: {}
			}

			for (let program of files) {
				let result = await egg(program.text, program.program, eggData.registry, eggData.num_memory, eggData.str_memory)

				eggData.stackTrace.push(...result.stackTrace)
				eggData.registry = { ...eggData.registry, ...result.registry }
				eggData.num_memory = { ...eggData.num_memory, ...result.num_memory }
				eggData.str_memory = { ...eggData.str_memory, ...result.str_memory }
			}
		}
	}
}

export { }