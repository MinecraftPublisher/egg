const { XMLHttpRequest } = require('xmlhttprequest')
const toml = require('toml')

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

let registry_list_cache: string[]

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
    if(!!registry_containers[mod_name]) {
        let Container = registry_containers[mod_name]
        let ModInfo = registry_containers[mod_name].Info
        let MainFile = Container.Files[ModInfo.MainFile]

        trace.push(...await egg(MainFile, filename + ' > ' + ModInfo.MainFile))
    } else {
        if(!registry_list_cache) {
            /// "Please wait while the registry cache is downloaded...", i
            registry_list_cache = (await fet('https://phazor.ir/egg/list.php')).text().split(', ')
        }

            if(registry_list_cache.includes(mod_name)) {
                let Container: Package = (await fet('https://phazor.ir/egg/containers/' + mod_name + '.json')).json()
                let ModInfo = Container.Info
                let MainFile = Container.Files[ModInfo.MainFile]

                trace.push(...await egg(MainFile, filename + ' > ' + ModInfo.MainFile))
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

export {}