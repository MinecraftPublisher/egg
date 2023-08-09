const toml = require('@iarna/toml')

interface PackageInfoJson {
    Name: string
    Author?: string
    Description?: string
    Version: number
    MainFile?: string
}

interface Package {
    Internal: boolean
    Info: PackageInfoJson
    Files: { [key: string]: string }
}

const registry_containers: { [key: string]: Package } = ({})

const fs = require('fs')

let registry_list_cache: string[] = __MODULE_STORAGE.registry_list_cache ?? []
const find_closest = ((path = './', depth = 0) => {
    if(fs.existsSync(path) && depth < 5) {
        if(fs.existsSync(path + '.egg')) {
            return path + '.egg/'
        } else {
            return find_closest(path + '../', depth + 1)
        }
    } else {
        return null
    }
})

let path
if(!__MODULE_STORAGE['mod_system_initiated']) {
    path = find_closest()
    if(path) {
        let moduleStorage = toml.parse(fs.readFileSync(path + 'egg.toml', 'utf-8'))
        registry_list_cache = [...registry_list_cache, ...moduleStorage.registry]

        let containers = moduleStorage.containerList
        for(let container of containers) {
            registry_containers[container] = toml.parse(fs.readFileSync(path + 'modules/' + container + '.toml', 'utf-8'))
        }

        __MODULE_STORAGE['mod_system_initiated'] = true
    }
}

const fet = (async (x) => {
    let out = await fetch(x)
    try {
        let c = out.clone()
        let _j = await c.json()
        let _t = await c.text()

        return {
            text: () => _t,
            json: () => _j
        }
    } catch (e) {
        let _t = await out.text()

        return {
            text: () => _t
        }
    }
})

//:mod
const mod = (async () => {
    let mod_name = args
    if (!!registry_containers[mod_name]) {
        let Container = registry_containers[mod_name]
        let ModInfo = registry_containers[mod_name].Info
        let MainFile = Container.Files[ModInfo.MainFile]

        const result = await egg(MainFile, filename + ' > ' + ModInfo.MainFile, registry, num_memory, str_memory)
        trace.push(...result.stackTrace)
    } else {
        if (!registry_list_cache) {
            /// "Please wait while we update your registry cache...", i
            registry_list_cache = (await fet('https://phazor.ir/egg/list.php')).text().split(', ')
            let moduleStorage = {
                path,
                creation: Date.now(),
                containers: []
            }

            if(!moduleStorage.path) {
                fs.mkdirSync('.egg/')
                fs.mkdirSync('.egg/modules/')
                fs.writeFileSync('.egg/egg.toml', toml.stringify(moduleStorage))
            }
        }

        if (registry_list_cache.includes(mod_name)) {
            let Container: Package = toml.parse((await fet('https://phazor.ir/egg/containers/' + mod_name + '.toml')).text())
            let ModInfo = Container.Info
            let MainFile = Container.Files[ModInfo.MainFile]

            Container.Internal = false
            registry_containers[mod_name] = Container

            fs.writeFileSync('.egg/modules/' + Container.Info.Name + '.toml', toml.stringify(Container))

            const result = await egg(MainFile, filename + ' > ' + ModInfo.MainFile, registry, num_memory, str_memory)
            trace.push(...result.stackTrace)
        } else {
            console.log('CRITICAL FAILURE: Couldn\'t find package \'' + mod_name + '\' in internal repository or the registry CDN to import at line ' + (i + 1) + '!')
            return returnAction.CRITICAL
        }
    }
})


//:load
//:import -> load
//:include -> load
//:require -> load
const load = (() => {
    let filename = args
})