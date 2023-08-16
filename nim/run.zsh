# rm -rf ./build/
# mkdir ./build/
rm -rf ./build/debug
rm -rf ./build/release

nim c egg.nim
mv ./egg ./build/debug

nim -d:release c egg.nim
mv ./egg ./build/release
ln -s ./build/release ./egg

echo
echo
echo
# negg run program.egg
