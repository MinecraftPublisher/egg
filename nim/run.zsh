nim c build.nim &> /dev/null
./build
rm -rf ./build

nim c dist/egg.nim &> /dev/null
./dist/egg