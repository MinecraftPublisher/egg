func() {
    echo \|-------------------------\|
    echo \|" $1"
    echo \|-------------------------\|
    echo
}

func "Building yolk and pan..."

cd ../
zsh run.zsh
cd build

func "Compiling input..."

./pan input.ysm

func "Executing output..."

./yolk a.yolk