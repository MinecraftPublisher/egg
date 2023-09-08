#include "file.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "yolk_header.h"

typedef uint8_t u8;
typedef char   *string;

typedef int bool;
enum BOOLEAN { false, true };

#define is(x) if (strcmp(x, command) == 0)
#define extend()                                                                                   \
    if (true) {                                                                                    \
        string old = result;                                                                       \
        result     = realloc(result, resultSize + 1);                                              \
        resultSize++;                                                                              \
        if (result == NULL) {                                                                      \
            printf("Not enough memory\n");                                                         \
            free(old);                                                                             \
            free(command);                                                                         \
            free(result);                                                                          \
            return NULL;                                                                           \
        }                                                                                          \
    }

#define push(x)                                                                                    \
    extend();                                                                                      \
    result[ resultSize - 2 ] = x;

#define end()                                                                                      \
    free(command);                                                                                 \
    continue;

#define byte() code[ pointer ]

#define next() push(code[ pointer++ ]);

#define skipWhitespace()                                                                           \
    while (pointer < size && (byte() == '\n' || byte() == ' ' || byte() == '\t')) { pointer++; }

#define check()                                                                                    \
    if (true) {                                                                                    \
        skipWhitespace();                                                                          \
        u8 oldPointer = pointer;                                                                   \
        while (pointer < size && (byte() >= '0' && byte() <= '9')) { pointer++; }                  \
        u8 length = pointer - oldPointer;                                                          \
        if (length == 0) {                                                                         \
            printf("Empty\n");                                                                     \
            free(command);                                                                         \
            continue;                                                                              \
        }                                                                                          \
        string output = malloc(sizeof(char) * length);                                             \
        if (output == NULL) {                                                                      \
            printf("Not enough memory\n");                                                         \
            free(command);                                                                         \
            free(output);                                                                          \
            free(result);                                                                          \
            return NULL;                                                                           \
        }                                                                                          \
                                                                                                   \
        for (int i = 0; i < length; i++) { output[ i ] = code[ oldPointer + i ]; }                 \
        u8 reg = atoi(output);                                                                     \
        free(output);                                                                              \
        if (reg > 19) {                                                                            \
            printf("Invalid register %i ('%c')\n", reg, reg);                                      \
            free(command);                                                                         \
            free(result);                                                                          \
            return NULL;                                                                           \
        }                                                                                          \
                                                                                                   \
        push(reg);                                                                                 \
    }

#define join(yasm, _size)                                                                          \
    if (true) {                                                                                    \
        File *output = assemble(yasm, _size, false);                                               \
        for (int i = 0; i < output->size; i++) { push(output->content[ i ]); }                     \
        free(output->content);                                                                     \
        free(output);                                                                              \
    }

#define macro(x) join(x, sizeof(x) / sizeof(char))

File *assemble(string _yasm, int size, bool eof) {
    string yolk_header = "";
    u8 header_size = 1;

    if(eof) {
        yolk_header = YOLK_ELF;
        header_size = sizeof(yolk_header) / sizeof(char);
    }

    string result     = malloc(sizeof(char) * header_size);
    u8     resultSize = header_size;

    if(eof) {
        for(u8 i = 0; i < header_size; i++) result[i] = yolk_header[i];
    }

    string code    = _yasm;
    u8     pointer = 0;

    while (pointer < size) {
        // store the previous value of pointer
        int lastPointer = pointer;

        // estimate command size
        while (pointer < size && byte() != '\n' && byte() != ' ' && byte() != '\t'
               && byte() != '\0') {
            pointer++;
        }

        // calculate command size
        int commandLength = pointer - lastPointer;
        // continue if the line is empty
        if (commandLength == 0) {
            pointer++;
            continue;
        }

        string command = malloc(sizeof(char) * commandLength);
        if (command == NULL) {
            printf("Not enough memory\n");
            free(command);
            free(result);
            return NULL;
        }

        for (int i = 0; i < commandLength; i++) { command[ i ] = code[ lastPointer + i ]; }

        is("null") { //& NULL command
            push(0);
            end();
        }

        is("exit") { //& EXIT command
            push(1);
            push(0);
            end();
        }

        is("charprint") { //& CHARPRINT command
            push(2);
            check();
            end();
        }

        is("store") { //& STORE command
            push(3);
            check();
            check();
            end();
        }

        is("load") { //& LOAD command
            push(4);
            check();
            check();
            end();
        }

        is("write") { //& WRITE command
            push(7);
            check();
            pointer++;
            while (byte() != '\n') { next(); }
            push(0);
            pointer++;
            end();
        }

        is("dump") { //& DUMP command
            push(6);
            check();
            end();
        }

        is("print") { //& PRINT command
            push(8);
            check();
            end();
        }

        is("const") { //& CONST command
            push(5);
            check();
            pointer++;
            check();
            push(0);
            end();
        }

        is("newline") { //& NEWLINE command
            macro("const 2 10\0charprint 2");
            end();
        }

        printf("Invalid command '%s'\n", command);
        pointer++;
        end();

        free(result);
        return NULL;
    }

    if (eof) {
        result[ resultSize - 1 ] = 1;
        resultSize++;
    }
    return createFile(resultSize, result);
}

#define assemble(yasm, size) assemble(yasm, size, true)

int main(int argc, string *argv) {
    if (argc < 2) {
        printf("Usage:\n    %s <filename>\n", argv[ 0 ]);
        return 1;
    }

    File *file = readFile(argv[ 1 ]);
    if (file->size == 0) {
        free(file);
        return 1;
    }

    printf("Assembling...\n");

    File *bytecode = assemble(file->content, file->size);
    if (bytecode->content == NULL) {
        printf("Empty build\n");

        free(file);
        free(bytecode->content);
        return 1;
    }

    File *output = writeFile("a.yolk", bytecode->size, bytecode->content);

    free(bytecode->content);
    free(file->content);

    free(file);

    bool result = !(output->size == 0);
    free(output);
    return result;
}