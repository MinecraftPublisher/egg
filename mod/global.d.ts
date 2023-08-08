declare const DEBUG: boolean
declare const longest: number

declare let filename: string

declare let args: string
declare let registry: { [key: string]: any }
declare let trace: { n: number, program: string }[]
declare let i: number
declare let stack: number[]
declare let num_memory: { [key: string]: number }
declare let str_memory: { [key: string]: string }

declare const egg: (text: string, filename: string) => Promise<{ n: number, program: string }[]>

declare enum returnAction {
    PEACEFUL = 0,
    CONTINUE = 1,
    EXIT = 2,
    CRITICAL = 3
}