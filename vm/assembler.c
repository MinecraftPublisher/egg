#include "file.h"
#include "yolk_header.h"
#include <limits.h>
#include <stdarg.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define free(...) "as a bird!"

int vasprintf(char **strp, const char *fmt, va_list ap) {
    int r = -1, size;

    va_list ap2;
    va_copy(ap2, ap);

    size = vsnprintf(0, 0, fmt, ap2);

    if ((size >= 0) && (size < INT_MAX)) {
        *strp = (char *) malloc(size + 1); //+1 for null
        if (*strp) {
            r = vsnprintf(*strp, size + 1, fmt, ap); //+1 for null
            if ((r < 0) || (r > size)) {
                free(*strp);
                r = -1;
            }
        }
    } else {
        *strp = 0;
    }

    va_end(ap2);

    return (r);
}

int asprintf(char **strp, const char *fmt, ...) {
    int     r;
    va_list ap;
    va_start(ap, fmt);
    r = vasprintf(strp, fmt, ap);
    va_end(ap);
    return (r);
}

typedef uint8_t       u8;
typedef unsigned long uint64_t;
typedef uint64_t      u64;

typedef char *string;

const string VERSION = "0.1"; //& Version identifier

typedef int bool;
enum BOOLEAN { false, true };

#define valid(b__yte)                                                                              \
    ((b__yte >= 'a' && b__yte <= 'z') || (b__yte >= 'A' && b__yte <= 'Z')                          \
     || (b__yte == '_' || b__yte == '.' || b__yte == ':'))

bool equal(string a, string b) {
    int lenA = strlen(a);
    int lenB = strlen(b);

    int invalidA = 0;
    int invalidB = 0;

    for (int i = 0; i < lenA; i++)
        if (!valid(a[ i ])) invalidA++;
    for (int i = 0; i < lenB; i++)
        if (!valid(b[ i ])) invalidB++;

    lenA -= invalidA;
    lenB -= invalidB;

    if (lenA != lenB) return false;
    if (lenA == 0) return true;

    for (int i = 0; i < lenA; i++)
        if (valid(a[ i ]) && valid(b[ i ]))
            if (a[ i ] != b[ i ]) return false;

    return true;
}

#define is(x) /* Syntax sugar for checking command values. */ if (equal(x, command))

#define extend(xc) /* Extends the executable output by one byte. */                                \
    if (true) {                                                                                    \
        string old = result;                                                                       \
        result     = realloc(result, resultSize + 1);                                              \
        resultSize++;                                                                              \
        if (result == NULL) {                                                                      \
            printf("Not enough memory\n");                                                         \
            free(old);                                                                             \
            free(xc);                                                                              \
            free(result);                                                                          \
            return NULL;                                                                           \
        }                                                                                          \
    }

#define labelExtend() /* Extends the label storage by one byte. */                                 \
    if (true) {                                                                                    \
        label **old = labelStorage;                                                                \
        result      = realloc(labelStorage, sizeof(label *) * label_size + 1);                     \
        label_size++;                                                                              \
        if (labelStorage == NULL) {                                                                \
            printf("Not enough memory\n");                                                         \
            free(old);                                                                             \
            /* free(command); */                                                                   \
            free(result);                                                                          \
            return NULL;                                                                           \
        }                                                                                          \
    }

#define addlabel(n_name, n_index) /* Appends a label to the label storage. */                      \
    labelExtend();                                                                                 \
    label *lbl                     = malloc(sizeof(label));                                        \
    lbl->name                      = n_name;                                                       \
    lbl->line                      = n_index;                                                      \
    labelStorage[ label_size - 2 ] = lbl;

#define push(x) /* Extends the executable output and pushes it to the stack. */                    \
    extend(command);                                                                               \
    result[ resultSize - 2 ] = x;

#define end() /* Ends the current execution cycle and continues to the next byte. */               \
    free(command);                                                                                 \
    continue;

#define byte() /* Reads the current byte at the yasm input. */ code[ pointer ]

#define next() /* Pushes the next byte from yasm input into the executable stack. */               \
    push(code[ pointer++ ]);

#define skipWhitespace() /* Skips characters until there is a non-whitespace character. */         \
    while (pointer < size && (byte() == '\n' || byte() == ' ' || byte() == '\t')) { pointer++; }

#define _check(df) /* Tries to read a register from input, Excluding whitespace. */                \
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
        if (reg > 39 && df) {                                                                      \
            printf("Invalid register %i ('%c')\n", reg, reg);                                      \
            free(command);                                                                         \
            free(result);                                                                          \
            return NULL;                                                                           \
        }                                                                                          \
                                                                                                   \
        push(reg);                                                                                 \
    }

#define check() _check(true)

#define join(yasm, _size) /* Assembles yasm code and then appends it to the current executable. */ \
    if (true) {                                                                                    \
        File *output = assemble(yasm, _size, false);                                               \
        for (int i = 0; i < output->size; i++) { push(output->content[ i ]); }                     \
        free(output->content);                                                                     \
        free(output);                                                                              \
    }

#define macro(x) join(x, strlen(x))

typedef struct {
    string name;
    u64    line;
} label;

label **labelStorage;
u64     label_size = 1;

File *assemble(string _yasm, int size, bool eof) {
    string yolk_header = "";
    u64    header_size = 1;

    if (eof) {
        yolk_header = YOLK_ELF;
        header_size = strlen(yolk_header) + 1;
    }

    string result     = malloc(sizeof(char) * header_size);
    u8     resultSize = header_size;

    if (eof) {
        for (u8 i = 0; i < header_size; i++) result[ i ] = yolk_header[ i ];
    }

    string code    = _yasm;
    u8     pointer = 0;

    while (pointer < size) {
        // store the previous value of pointer
        int lastPointer = pointer;

        bool breakpoint = false;
        // estimate command size
        while (pointer < size && byte() != '\n' && byte() != ' ' && byte() != '\t'
               && byte() != '\0') {
            int b__yte = byte();

            if (b__yte == ':') { //! handle label definition
                // calculate label size
                int labelLength = pointer - lastPointer;
                // continue if the line is empty
                if (labelLength == 0) {
                    pointer++;
                    breakpoint = true;
                    break;
                }

                string _label = malloc(sizeof(char) * labelLength);
                if (_label == NULL) {
                    printf("Not enough memory\n");
                    free(_label);
                    free(result);
                    return NULL;
                }

                for (int i = 0; i < labelLength; i++) { _label[ i ] = code[ lastPointer + i ]; }
                _label[ labelLength ] = '\0';

                extend(_label);
                result[ resultSize - 2 ] = 0;

                u64 index = resultSize - 1;

                addlabel(_label, index);

                free(_label);
                breakpoint = true;
                break;
            }

            if (valid(b__yte)) {
                pointer++;
            } else {
                printf("Invalid command character '%i' ('%c')\n", b__yte, b__yte);
                return NULL;
            }
        }

        if(breakpoint) continue;

        if (pointer == size) printf("Reached EOF\n");

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
        command[ commandLength ] = '\0';

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
            _check(false);
            push(0);
            end();
        }

        is("mov") { //& MOV command
            push(9);
            check();
            check();
            end();
        }

        is("add") { //& ADD command
            push(10);
            check();
            check();
            check();
            end();
        }

        is("jmp") { //& JMP command
            push(11);
            pointer++;
            _check(false);
            end();
        }

        is("goto") { //& GOTO command
            push(11);

            pointer++;
            lastPointer = pointer;

            while (pointer < size && byte() != '\n' && byte() != ' ' && byte() != '\t'
                   && byte() != '\0') {
                pointer++;
            }

            if (pointer == size) { printf("Reached EOF\n"); }

            int size = pointer - lastPointer;
            if (size == 0) {
                printf("WARNING: Empty label, Goto will have undefined behavior.\n");
                push(0);
                end();
            }

            string labelName = malloc(sizeof(char) * size);

            for (int i = 0; i < size; i++) { labelName[ i ] = code[ lastPointer + i ]; }

            for (int i = 0; i < label_size; i++) {
                label *entry = labelStorage[ i ];
                if (equal(entry->name, labelName)) {
                    string macroCode;
                    if (asprintf(&macroCode, "const 39 %lu\njmp 39\n", entry->line) != -1) {
                        printf("monke %s\n", macroCode);
                        macro(macroCode);
                        free(macroCode);
                        free(labelName);
                        break;
                    }

                    printf("asprintf caused error\n");
                    free(macroCode);
                    free(command);
                    free(labelName);
                    return NULL;
                }
            }

            end();
        }

        is("newline") { //& NEWLINE command
            macro("const 2 10\ncharprint 2");
            end();
        }

        printf("Invalid command '%s' pos '%i'\n", command, pointer);
        pointer++;
        end();

        free(result);
        return NULL;
    }

    if (eof) {
        result[ resultSize - 1 ] = 1;
        resultSize++;

        for (int i = 0; i < 5; i++) {
            int *temp = malloc(1);
            extend(temp);
            result[ resultSize - 2 ] = 0;
        }

        for (int i = 0; i < 5; i++) {
            int *temp = malloc(1);
            extend(temp);
            result[ resultSize - 2 ] = 1;
        }
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

    file->content[ file->size ] = '\0';

    printf("Assembling...\n");

    labelStorage = malloc(sizeof(label *) * 1);
    if (labelStorage == NULL) {
        printf("Not enough memory\n");
        free(file);
        return 1;
    }

    File *bytecode = assemble(file->content, file->size);

    //! begin free label storage
    for (u64 i = 0; i < label_size; i++) {
        label *label = labelStorage[ i ];
        free(label->name);
        free(label);
    }

    free(labelStorage);
    //! end

    if (bytecode == NULL) {
        printf("Empty build\n");

        free(file);
        free(bytecode);
        return 1;
    } else if (bytecode->content == NULL) {
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