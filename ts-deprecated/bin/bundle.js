#!/usr/bin/env node
//@ts-nocheck
const node_path = process.argv[0];
const __filename = process.argv[1];
const args = process.argv.slice(2);
import { Chalk } from 'chalk';
const chalk = new Chalk();
import * as fs from 'fs';
let unknown = args.filter(e => !fs.existsSync(e));
let files = args.filter(e => fs.existsSync(e)).map(e => ({
    program: e,
    text: fs.readFileSync(e, 'utf-8')
}));
const egg_construct = (() => {
    const sgn = ((x) => x > 0 ? 1 : x < 0 ? -1 : 0);
    const DEBUG = false;
    const __MODULE_STORAGE = {};
    const __debug = require('debug');
    const log = __debug('egg');
    const loggers = { "branch": __debug("branch"), "exit": __debug("exit"), "goto": __debug("goto"), "echo": __debug("echo"), "fmt": __debug("fmt"), "mod": __debug("mod"), "include": __debug("include"), "add": __debug("add"), "+": __debug("+"), "subtract": __debug("subtract"), "-": __debug("-"), "multiply": __debug("multiply"), "*": __debug("*"), "pow": __debug("pow"), "**": __debug("**"), "divide": __debug("divide"), "/": __debug("/"), "reverse": __debug("reverse"), "rev": __debug("rev") };
    const _ = loggers;
    const debug = ((...g) => {
        log(...g);
    });
    let returnAction;
    (function (returnAction) {
        returnAction[returnAction["PEACEFUL"] = 0] = "PEACEFUL";
        returnAction[returnAction["CONTINUE"] = 1] = "CONTINUE";
        returnAction[returnAction["EXIT"] = 2] = "EXIT";
        returnAction[returnAction["CRITICAL"] = 3] = "CRITICAL";
    })(returnAction || (returnAction = {}));
    const egg = (async (text, filename, registry = {}, num_memory = {}, str_memory = {}) => {
        const stack = [];
        const trace = [];
        stack.push(0);
        let lines = text.split('\n');
        const longest = lines.filter(e => e.startsWith('str::') || e.startsWith('num::') || e.startsWith('int::')).length > 0 ? lines
            .filter(e => e.startsWith('str::') || e.startsWith('num::') || e.startsWith('int::'))
            .sort((a, b) => sgn(b.split(' ')[0].length - a.split(' ')[0].length))[0]
            .split(' ')[0].length : 1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i] === '') {
                debug("Continue from empty line", i);
                continue;
            }
            // if(DEBUG) console.log(i)
            stack[stack.length - 1] = i;
            let line = lines[i];
            if (line.startsWith(':')) {
                if (stack.length !== 1) {
                    stack.splice(stack.length - 1);
                    i = stack[stack.length - 1];
                    debug("Continue from stack trace call", i);
                    continue;
                }
                let name = line.substring(1).split(' ')[0];
                registry[name] = i;
                if (name !== 'main') {
                    i++;
                    while (!lines[i].startsWith(':main')) {
                        if (lines[i].startsWith(':')) {
                            let name = lines[i].substring(1).split(' ')[0];
                            registry[name] = i;
                        }
                        i++;
                    }
                }
                debug("Continue from segment registry", i);
                continue;
            }
            trace.push({
                n: i + 1,
                program: filename
            });
            if (line.startsWith('str::')) {
                let name = line.substring(5).split(' ')[0];
                let args = line.substring(name.length + 6);
                str_memory[name] = args;
                debug("Continue from string declaration", i);
                continue;
            }
            if (line.startsWith('num::')) {
                let name = line.substring(5).split(' ')[0];
                let args = parseFloat(line.substring(name.length + 6));
                if (isNaN(args)) {
                    console.log('CRITICAL FAILURE: Couldn\'t convert \'' + line.substring(name.length + 6) + '\' to float at line ' + (i + 1) + '!');
                    return {
                        stackTrace: [...trace, {
                                n: -1,
                                program: 'CRITICAL'
                            }],
                        registry,
                        num_memory,
                        str_memory
                    };
                }
                num_memory[name] = parseFloat(args.toString());
                debug("Continue from integer declaration", i);
                continue;
            }
            if (line.startsWith('int::')) {
                let name = line.substring(5).split(' ')[0];
                let args = parseFloat(line.substring(name.length + 6));
                if (isNaN(args)) {
                    console.log('CRITICAL FAILURE: Couldn\'t convert \'' + line.substring(name.length + 6) + '\' to float at line ' + (i + 1) + '!');
                    return {
                        stackTrace: [...trace, {
                                n: -1,
                                program: 'CRITICAL'
                            }],
                        registry,
                        num_memory,
                        str_memory
                    };
                }
                num_memory[name] = parseFloat(args.toString());
                debug("Continue from integer declaration", i);
                continue;
            }
            let command = line.split(' ')[0];
            let args = line.substring(command.length + 1).trim();
            //:branch
            const branch = (async () => {
                let addcond = args.split(' ')[0];
                let cond = str_memory[addcond] ?? num_memory[addcond];
                let trueCase = registry[args.split(' ')[1]] ?? (i + 1);
                let falseCase = registry[args.split(' ')[2]] ?? (i + 1);
                if (!addcond) {
                    console.log('CRITICAL FAILURE: Condition memory address at line ' + (i + 1) + ' not provided!', args.split(' ')[0]);
                    return returnAction.CRITICAL;
                }
                else if (!addcond) {
                    console.log('CRITICAL FAILURE: True case memory address at line ' + (i + 1) + ' not provided!', args.split(' ')[1]);
                    return returnAction.CRITICAL;
                }
                if (cond === 'true' || !!cond) {
                    stack[stack.length - 1] = i;
                    stack.push(trueCase);
                    i = trueCase;
                    return returnAction.CONTINUE;
                }
                else {
                    stack[stack.length - 1] = i;
                    stack.push(falseCase);
                    i = falseCase;
                    return returnAction.CONTINUE;
                }
            });
            //:exit
            const exit = (async () => {
                return returnAction.EXIT;
            });
            //:goto
            const goto = ((segment = args.split(' ')[0]) => {
                if (!registry[segment] && registry[segment] !== 0) {
                    console.log('CRITICAL FAILURE: Couldn\'t find segment \'' + segment + '\' to run goto at line ' + (i + 1) + '!');
                    return returnAction.CRITICAL;
                }
                stack[stack.length - 1] = i + 1;
                stack.push(registry[segment]);
                i = registry[segment];
                return returnAction.PEACEFUL;
            });
            //:echo -> fmt
            const echo = (() => {
                if (DEBUG) {
                    let varname = args.split(' ')[0];
                    let space = longest - varname.length;
                    space = space < 0 ? 0 : space;
                    console.log(`[${varname}]${new Array(space).fill(' ').join('')}| ` + (str_memory[varname] ?? num_memory[varname] ?? '(null)'));
                }
                else {
                    console.log(str_memory[args.split(' ')[0]] ?? '(null)');
                }
                return returnAction.PEACEFUL;
            });
            //:fmt -> echo
            const fmt = (() => {
                let str = args;
                for (let mt of (str.match(/%{[^} ]+}/g) ?? [])) {
                    let name = mt.substring(2, mt.length - 1);
                    str = str.replaceAll(mt, str_memory[name] ?? num_memory[name]?.toString() ?? '(null)');
                }
                console.log(str);
                return returnAction.PEACEFUL;
            });
            const registry_containers = ({});
            const fs = require('fs');
            let registry_list_cache = __MODULE_STORAGE.registry_list_cache ?? [];
            const find_closest = ((path = './', depth = 0) => {
                if (fs.existsSync(path) && depth < 5) {
                    if (fs.existsSync(path + '.egg')) {
                        return path + '.egg/';
                    }
                    else {
                        return find_closest(path + '../', depth + 1);
                    }
                }
                else {
                    return null;
                }
            });
            let path;
            if (!__MODULE_STORAGE['mod_system_initiated']) {
                path = find_closest();
                if (path) {
                    let moduleStorage = JSON.parse(fs.readFileSync(path + 'egg.js', 'utf-8'));
                    registry_list_cache = [...registry_list_cache, ...moduleStorage.registry];
                    let containers = moduleStorage.containerList;
                    for (let container of containers) {
                        registry_containers[container] = JSON.parse(fs.readFileSync(path + 'modules/' + container + '.js', 'utf-8'));
                    }
                    __MODULE_STORAGE['mod_system_initiated'] = true;
                }
            }
            const fet = (async (x) => {
                let out = await fetch(x);
                try {
                    let c = out.clone();
                    let _j = await c.json();
                    let _t = await c.text();
                    return {
                        text: () => _t,
                        json: () => _j
                    };
                }
                catch (e) {
                    let _t = await out.text();
                    return {
                        text: () => _t
                    };
                }
            });
            //:mod
            //:include -> mod
            const mod = (async () => {
                let mod_name = args;
                if ((args.startsWith('./') || args.startsWith('/') || args.startsWith('../')) && args.endsWith('.egg')) {
                    if (!fs.existsSync(args)) {
                        console.log('CRITICAL FAILURE: Couldn\'t find file \'' + args + '\' in filesystem to import at line ' + (i + 1) + '!');
                        return returnAction.CRITICAL;
                    }
                    const MainFile = fs.readFileSync(args, 'utf-8');
                    const Container = {
                        Internal: false,
                        Info: {
                            Author: 'System',
                            Name: args,
                            Version: 0,
                            Description: 'Imported package',
                            MainFile: args
                        },
                        Files: {
                            args: MainFile
                        }
                    };
                    registry_containers[args] = Container;
                    const result = await egg(MainFile, filename + ' > ' + args, registry, num_memory, str_memory);
                    trace.push(...result.stackTrace);
                    return returnAction.PEACEFUL;
                }
                if (!!registry_containers[mod_name]) {
                    let Container = registry_containers[mod_name];
                    let ModInfo = registry_containers[mod_name].Info;
                    let MainFile = Container.Files[ModInfo.MainFile];
                    const result = await egg(MainFile, filename + ' > ' + ModInfo.MainFile, registry, num_memory, str_memory);
                    trace.push(...result.stackTrace);
                    return returnAction.PEACEFUL;
                }
                else {
                    if (!registry_list_cache) {
                        debug("Please wait while we update your registry cache...", i);
                        registry_list_cache = (await fet('https://phazor.ir/egg/list.php')).text().split(', ');
                        let moduleStorage = {
                            path,
                            creation: Date.now(),
                            containers: []
                        };
                        if (!moduleStorage.path) {
                            fs.mkdirSync('.egg/');
                            fs.mkdirSync('.egg/modules/');
                            fs.writeFileSync('.egg/egg.js', JSON.stringify(moduleStorage));
                        }
                    }
                    if (registry_list_cache.includes(mod_name)) {
                        let Container = JSON.parse((await fet('https://phazor.ir/egg/containers/' + mod_name + '.js')).text());
                        let ModInfo = Container.Info;
                        let MainFile = Container.Files[ModInfo.MainFile];
                        Container.Internal = false;
                        registry_containers[mod_name] = Container;
                        fs.writeFileSync('.egg/modules/' + Container.Info.Name + '.js', JSON.stringify(Container));
                        const result = await egg(MainFile, filename + ' > ' + ModInfo.MainFile, registry, num_memory, str_memory);
                        trace.push(...result.stackTrace);
                        return returnAction.PEACEFUL;
                    }
                    else {
                        console.log('CRITICAL FAILURE: Couldn\'t find package \'' + mod_name + '\' in internal repository or the registry CDN to import at line ' + (i + 1) + '!');
                        return returnAction.CRITICAL;
                    }
                }
            });
            //:add
            //:+ -> add
            const add = (() => {
                let adr1 = args.split(' ')[0];
                let adr2 = args.split(' ')[1];
                let dest = args.split(' ')[2];
                let num1 = num_memory[adr1];
                let num2 = num_memory[adr2];
                if (!num1) {
                    console.log('CRITICAL ERROR: Cannot find integer ' + adr1 + ' in memory at line ' + i + '!');
                    return returnAction.CRITICAL;
                }
                else if (!num2) {
                    console.log('CRITICAL ERROR: Cannot find integer ' + adr2 + ' in memory at line ' + i + '!');
                    return returnAction.CRITICAL;
                }
                num_memory[dest] = num1 + num2;
                return returnAction.PEACEFUL;
            });
            //:subtract
            //:- -> subtract
            const subtract = (() => {
                let adr1 = args.split(' ')[0];
                let adr2 = args.split(' ')[1];
                let dest = args.split(' ')[2];
                let num1 = num_memory[adr1];
                let num2 = num_memory[adr2];
                if (!num1) {
                    console.log('CRITICAL ERROR: Cannot find integer ' + adr1 + ' in memory at line ' + i + '!');
                    return returnAction.CRITICAL;
                }
                else if (!num2) {
                    console.log('CRITICAL ERROR: Cannot find integer ' + adr2 + ' in memory at line ' + i + '!');
                    return returnAction.CRITICAL;
                }
                num_memory[dest] = num1 + num2;
                return returnAction.PEACEFUL;
            });
            //:multiply
            //:* -> multiply
            const multiply = (() => {
                let adr1 = args.split(' ')[0];
                let adr2 = args.split(' ')[1];
                let dest = args.split(' ')[2];
                let num1 = num_memory[adr1];
                let num2 = num_memory[adr2];
                if (!num1) {
                    console.log('CRITICAL ERROR: Cannot find integer ' + adr1 + ' in memory at line ' + i + '!');
                    return returnAction.CRITICAL;
                }
                else if (!num2) {
                    console.log('CRITICAL ERROR: Cannot find integer ' + adr2 + ' in memory at line ' + i + '!');
                    return returnAction.CRITICAL;
                }
                num_memory[dest] = num1 * num2;
                return returnAction.PEACEFUL;
            });
            //:pow
            //:** -> pow
            const pow = (() => {
                let adr1 = args.split(' ')[0];
                let adr2 = args.split(' ')[1];
                let dest = args.split(' ')[2];
                let num1 = num_memory[adr1];
                let num2 = num_memory[adr2];
                if (!num1) {
                    console.log('CRITICAL ERROR: Cannot find integer ' + adr1 + ' in memory at line ' + i + '!');
                    return returnAction.CRITICAL;
                }
                else if (!num2) {
                    console.log('CRITICAL ERROR: Cannot find integer ' + adr2 + ' in memory at line ' + i + '!');
                    return returnAction.CRITICAL;
                }
                num_memory[dest] = num1 ** num2;
                return returnAction.PEACEFUL;
            });
            //:divide
            //:/ -> divide
            const divide = (() => {
                let adr1 = args.split(' ')[0];
                let adr2 = args.split(' ')[1];
                let dest = args.split(' ')[2];
                let num1 = num_memory[adr1];
                let num2 = num_memory[adr2];
                if (!num1) {
                    console.log('CRITICAL ERROR: Cannot find integer ' + adr1 + ' in memory at line ' + i + '!');
                    return returnAction.CRITICAL;
                }
                else if (!num2) {
                    console.log('CRITICAL ERROR: Cannot find integer ' + adr2 + ' in memory at line ' + i + '!');
                    return returnAction.CRITICAL;
                }
                num_memory[dest] = num1 / num2;
                return returnAction.PEACEFUL;
            });
            //:reverse
            //:rev -> reverse
            const reverse = (() => {
                let adr = args.split(' ')[0];
                let dest = args.split(' ')[1];
                let num = num_memory[adr];
                if (!num) {
                    console.log('CRITICAL ERROR: Cannot find integer ' + adr + ' in memory at line ' + i + '!');
                    return returnAction.CRITICAL;
                }
                num_memory[dest] = -num;
                return returnAction.PEACEFUL;
            });
            let internals = {
                "branch": branch,
                "exit": exit,
                "goto": goto,
                "echo": fmt,
                "fmt": echo,
                "mod": mod,
                "include": mod,
                "add": add,
                "+": add,
                "subtract": subtract,
                "-": subtract,
                "multiply": multiply,
                "*": multiply,
                "pow": pow,
                "**": pow,
                "divide": divide,
                "/": divide,
                "reverse": reverse,
                "rev": reverse
            };
            command = command.replaceAll('.', '_');
            let isInternal = !!internals[command];
            if (isInternal) {
                const returnValue = await internals[command]();
                if (returnValue === returnAction.CONTINUE)
                    continue;
                else if (returnValue === returnAction.PEACEFUL) { }
                else if (returnValue === returnAction.CRITICAL) {
                    throw {
                        stackTrace: [...trace, {
                                n: -1,
                                program: 'CRITICAL'
                            }],
                        registry,
                        num_memory,
                        str_memory
                    };
                }
                else if (returnValue === returnAction.EXIT) {
                    return {
                        stackTrace: [...trace, {
                                n: -1,
                                program: 'EXIT'
                            }],
                        registry,
                        num_memory,
                        str_memory
                    };
                }
            }
            else {
                console.log('CRITICAL FAILURE: Couldn\'t spot internal function \'' + command + '\' at line ' + (i + 1) + '!');
                return {
                    stackTrace: [...trace, {
                            n: -1,
                            program: 'CRITICAL'
                        }],
                    registry,
                    num_memory,
                    str_memory
                };
            }
        }
        debug("Loop exit");
        return {
            stackTrace: trace,
            registry,
            num_memory,
            str_memory
        };
    });
    return egg;
});
if (args.length === 0) {
    console.log('Usage:\n	egg [file_names_separated_by_spaces]\n	egg minimal -> Switch back to fancy version\n	egg sync -> Sync minimal version with the fancy builder');
}
else if (args[0] === 'minimal') {
    console.log('Activating fancy mode...');
    const target = __filename;
    fs.writeFileSync(target, fs.readFileSync(target, 'utf-8').replace('\'bundle.js\'', '\'fancy.ts\''));
    console.log('Done!');
}
else if (args[0] === 'sync') {
    console.log('Syncing minimal mode...');
    await import(__filename.replaceAll('/index.ts', '/fancy.ts'));
    console.log('\rDone!       ');
}
else {
    const egg = egg_construct();
    if (unknown.length > 0) {
        for (let missing of unknown) {
            console.log(chalk.redBright.bold('error') + ': Program \'' + missing + '\' does not exist!');
        }
    }
    else {
        let eggData = {
            stackTrace: [],
            registry: {},
            num_memory: {},
            str_memory: {}
        };
        const start = performance.now();
        for (let program of files) {
            let result = await egg(program.text, program.program, eggData.registry, eggData.num_memory, eggData.str_memory);
            eggData.stackTrace.push(...result.stackTrace);
            eggData.registry = { ...eggData.registry, ...result.registry };
            eggData.num_memory = { ...eggData.num_memory, ...result.num_memory };
            eggData.str_memory = { ...eggData.str_memory, ...result.str_memory };
        }
        console.log(chalk.bold.hex('#888')('$ Took ' + Math.round((performance.now() - start) * 1000) / 1000 + 'ms.'));
    }
}
