import os
import strutils

discard existsOrCreateDir("dist/")

var file = readFile("egg.nim")
var modlist: seq[string] = @[]

# recursively list files
for f in walkDirRec("mod/"): 
    if f.endsWith(".nim"): modlist.add(f)

echo modlist

writeFile("dist/egg.nim", file)