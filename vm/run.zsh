rm -rf bulid/pan
rm -rf build/yolk

clang assembler.c -o build/pan
clang vm.c -o build/yolk

echo Done