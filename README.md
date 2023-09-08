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

# egg

egg is a **general purpose**, **abstract**, **interpreted**, **type-safe**
programming language, with **strict performance** and **manual garbage
collection**. egg's syntax is straightforward, and egg's dynamic evaluation also
allows to extend the syntax in creative ways.

## typescript version deprecation notice

The typescript version of egg is deprecated and is not updated with the new
syntax and features. You should instead use the _nim version_, Which has a more
flexible syntax and is also supported by the included vscode extension for a
more streamline development experience.

## building and installation

### requirements

To build the nim version, You need a local installation of the nim toolchain,
With a version of atleast 1.6.12, Alongside the contents of the `nim/` folder.
Assuming you have the basic unix commands (`rm`, `mv`, `echo`, `sudo`, `cp`)
installed, A local installation of zsh is also recommended to avoid unexpected
compatibility issues. You would also need to create a `build/` folder in the
`nim/` directory. Your directory structure should look like this:

```diff
+ nim/
  - run.zsh
  - egg.nim
  + mod/
  - __builtin__.egg
  + build
```

### building

To build the nim binary for both the release and debug version, Just run
`zsh run.zsh`, Or any other unix shell you use. The corresponding binaries will
be placed inside the `build/` folder, So it'll look something like this:

```diff
+ nim/
  - run.zsh
  - egg.nim
  + mod/
  - __bulitin__.egg
  + build/
    - release
    - debug
```

After the build is halfway done and you see a multi-line block of text starting
with `[NOTICE]`, You can optionally write egg to the same directory as your nim
installation, Assuming it is included in your `$PATH` variable. This is optional
and does not cause any issues if skipped.

### installation

The build script automatically does this for you, but you can copy either the
debug or the release binary from the `build/` folder (see **building**), And do
whatever you want with it!

### syntax guide

Coming soon, Believe me, I'll write this someday!

### legacy typescript version

Check `DEPRECATED.md`.
