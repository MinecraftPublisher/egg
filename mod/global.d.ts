declare const DEBUG: boolean
declare const longest: number

declare let filename: string

type Iregistry = { [key: string]: number }
type InumberMemory = { [key: string]: number }
type IstringMemory = { [key: string]: string }

interface IeggReturn {
    stackTrace: { n: number, program: string }[]
    registry: Iregistry
    num_memory: InumberMemory
    str_memory: IstringMemory
}

declare let args: string
declare let i: number
declare let stack: number[]
declare let registry: Iregistry
declare let num_memory: InumberMemory
declare let str_memory: IstringMemory
declare let trace: { n: number, program: string }[]

declare const __MODULE_STORAGE: { [key: string]: any }

type eggReturn = Promise<IeggReturn>

declare const egg: (text: string, filename: string, registry: Iregistry, num_memory: InumberMemory, str_memory: IstringMemory) => eggReturn

declare enum returnAction {
    PEACEFUL = 0,
    CONTINUE = 1,
    EXIT = 2,
    CRITICAL = 3
}