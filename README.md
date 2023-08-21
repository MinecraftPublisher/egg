```
                                ████████
                              ██        ██
                            ██▒▒▒▒        ██
                          ██▒▒▒▒▒▒      ▒▒▒▒██
                          ██▒▒▒▒▒▒      ▒▒▒▒██
                        ██  ▒▒▒▒        ▒▒▒▒▒▒██
                        ██                ▒▒▒▒██
                      ██▒▒      ▒▒▒▒▒▒          ██
                      ██      ▒▒▒▒▒▒▒▒▒▒        ██
                      ██      ▒▒▒▒▒▒▒▒▒▒    ▒▒▒▒██
                      ██▒▒▒▒  ▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒██
                        ██▒▒▒▒  ▒▒▒▒▒▒    ▒▒▒▒██
                        ██▒▒▒▒            ▒▒▒▒██
                          ██▒▒              ██
                            ████        ████
                                ████████
```
# _@agent\_z_/**egg**
To install egg, Simply run `npm i -g @agent_z/egg`. Want to use another package manager? Check the notice!

## cli tool
The cli tool is your main access point to the egg interpreter. However, Some may find it slow. To switch to a faster, Minimal version, just run `egg minimal` and you will be taken into a familiar, Blazingly fast environment. To upgrade your minimal version incase you made changes to the fancy version or have just ran an update, Run `egg sync` to call the fancy version and update your minimal cli. (**WARNING**: The minimal version requires the fancy version to be ran ATLEAST once, Do not modify the settings in the package itself without building the minimal cli first.)

## all cli tool commands:
- [egg] Main, Switchable cli interface
- [fegg] Always fancy version (**f**ancy **e**gg)
- [megg] Always minimal version (**m**inimal **e**gg) (REQUIRES fancy version to be ran atleast once)
- [negg] Nim version, Requires the `nim/` folder's files to be compiled.

## List of compatible package managers
- npm
- pnpm
- bun

## Why Yarn doesn't work
Egg uses [Bun](https://bun.sh/) as its main runtime to cut slack and run the typescript directly and efficiently. So, Bun is naturally included in its dependencies. However, Yarn does not allow linking binaries, So yarn will throw an error and die during the installation process. Any other package manager is fine though!

## Recommendations
I recommend you install bun from the official website before installing Egg, As I have not tested wether the bun dependency works well on devices without bun installed or not.

## VScode extensions: Syntax highlighting, Error checking and Hover information
You should build and install it yourself. The features are documented in the README file in the `extension/` folder.

## NIM version
If you want to have a truly low level experience, You could build the nim version instead. The source code is available at `nim/` in this same directory.

## Syntax guide
Coming soon!