#include "file.h"
#include "settings.h"
#include "table.h"
#include "yolk_header.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef char *string;

typedef unsigned long uint64_t;
typedef uint64_t      u64;

const string VERSION = "0.1"; //& Version identifier

typedef enum { VM_EXIT_OK, VM_EXIT_EOF, VM_EXIT_FAILURE } VM_EXIT_STATUS;

enum OPCODE { //? A "//!" means the opcode has been implemented.
    //! NULL()                             - Empty operation
    OP_NULL,
    //! EXIT()                             - Stop execution and exit
    OP_EXIT,
    //! CHARPRINT(REG)                     - Prints register value
    OP_CHARPRINT,
    //! STORE(REG INDEX, REG DATA)         - Places register content in memory
    OP_STORE,
    //! LOAD(REG INDEX, REG TARGET)        - Loads value from memory and places it into register
    OP_LOAD,
    //! CONST(REG TARGET, U8 ...)          - Adds number constants and places them into memory.
    OP_CONST,
    //! DUMP(REG TARGET)                   - Prints the numeric representation of a register.
    OP_DUMP,
    //! WRITE(REG TARGET, U8 ...)          - Places data into memory starting from the specified
    //! target.
    //!                                      WARNING: Might unexpectedly override data!
    OP_WRITE,
    //! PRINT(REG TARGET)                  - Prints characters from memory starting from the
    //! specified
    //!                                      target.
    OP_PRINT,
    //! MOVE(REG SRC, REG DEST)            - Moves the contents of a register into another register.
    OP_MOVE,
    //! ADD(REG LEFT, REG RIGHT, REG DEST) - Adds the contents of the left hand and right hand
    //!                                      together and places it into the specified target.
    OP_ADD,
    //! JUMP(REG POSITION)                 - Jumps to the specified index inside the current
    //!                                      executable.
    OP_JUMP
};

typedef uint8_t u8;

#define READ_BYTE() (&pointer[ pointerIndex++ ])

Table *memoryTable;

VM_EXIT_STATUS vm(string code) {
    // initialize pointer
    string pointer      = code;
    u64    pointerIndex = 0;

    // initialize registers
    u64 registers[ 40 ] = {};

    for (;;) {
        u8 *op = (u8 *) READ_BYTE();

        if (op == NULL) {
            // VM has reached end of file, Exit the program.
            return VM_EXIT_EOF;
        }

        enum OPCODE instruction = *op;
        // printf("Got instruction %i at %i\n", instruction, pointerIndex);
        switch (instruction) {
            case OP_JUMP: { //~ JUMP operator
                // Jumps to the position in source code indicated by the target register value.
                // Argument count: 1
                // Argument 1: Destination register

                u8 label = *READ_BYTE();
                REGISTER_CHECK(label);
                u64 index = registers[ label ];

                pointerIndex = index;
            }

            case OP_ADD: { //~ ADD operator
                // Adds the contents of the left hand and right hand together and places it into the
                // specified target. Argument count: 3 Argument 1: Lefthand register Argument 2:
                // Righthand register Argument 3: Destination register

                u8 left = *READ_BYTE();
                REGISTER_CHECK(left);
                u8 right = *READ_BYTE();
                REGISTER_CHECK(right);
                u8 target = *READ_BYTE();
                REGISTER_CHECK(target);

                registers[ target ] = registers[ left ] + registers[ right ];

                continue;
            }

            case OP_MOVE: { //~ MOVE operator
                // Moves the data from one register to another.
                // Argument count: 2
                // Argument 1: Source register.
                // Argument 2: Destination register.
                u8 src = *READ_BYTE();
                REGISTER_CHECK(src);
                u8 dst = *READ_BYTE();
                REGISTER_CHECK(dst);

                registers[ dst ] = registers[ src ];

                continue;
            }

            case OP_CONST: { //~ CONST operator
                // Puts an integer value inside of a register.
                // Argument count: 2+
                // Argument 1: Register to put the constant in
                // Arguments 2..n: The numbers to add up together and place in the register, Ends
                // with `\0`.

                u8 _register = *READ_BYTE();
                REGISTER_CHECK(_register);
                u8 output = 0;
                u8 read   = *READ_BYTE();

                while (read != 0) {
                    output += read;
                    read = *READ_BYTE();
                }

                registers[ _register ] = output;

                continue;
            }

            case OP_WRITE: { //~ WRITE operator
                // Puts an integer value inside of a memory address.
                // Argument count: 2+
                // Argument 1: Register containing the memory address to put the data in.
                // Arguments 2..n: The numbers to place in the memory, Ends with `\0`.

                u8 _memoryAddress = *READ_BYTE();
                REGISTER_CHECK(_memoryAddress);
                u8 memoryAddress = registers[ _memoryAddress ];

                u8 index = 0;

                u8 read = *READ_BYTE();

                while (read != 0) {
                    // reallocate space
                    if (memoryTable->table_size < memoryAddress + index) {
                        memoryTable->array
                            = realloc(memoryTable->array, sizeof(u8) * (memoryAddress + index));
                        memoryTable->table_size = memoryAddress + index;
                    }

                    // write data to storage
                    memoryTable->array[ memoryAddress + index ] = (u64) read;
                    printf("\"%i\" %lu\n", read, memoryTable->array[ memoryAddress + index ]);

                    // read next byte
                    read = *READ_BYTE();
                    index++;
                }

                // memoryTable->array[memoryAddress + index] = 0;

                index = 0;
                while(memoryTable->array[memoryAddress + index] != 0) {
                    printf("'%lu'\n", memoryTable->array[memoryAddress + index]);
                    index++;
                }

                continue;
            }

            case OP_STORE: { //~ STORE operator
                // Puts the value of a register into the selected memory address.
                // Argument count: 2
                // Argument 1: Register containing memory index to place the value in
                // Argument 2: Register containing the data to put in memory

                u8 _memoryDestination = *READ_BYTE();
                REGISTER_CHECK(_memoryDestination);
                u8 memoryDestination = registers[ _memoryDestination ];

                u8 _value = *READ_BYTE();
                REGISTER_CHECK(_value);
                u8 value = registers[ _value ];

                if (memoryTable->table_size < memoryDestination) {
                    u8 oldSize = memoryTable->table_size;

                    memoryTable->array
                        = realloc(memoryTable->array, sizeof(u8) * memoryDestination);
                    memoryTable->table_size = memoryDestination;

                    for (u8 i = oldSize; i < memoryDestination; i++) {
                        memoryTable->array[ i ] = 0;
                    }
                }

                memoryTable->array[ memoryDestination ] = value;

                continue;
            }

            case OP_LOAD: { //~ LOAD operator
                // Reads the value of a memory address and places it inside a register.
                // Argument count: 2
                // Argument 1: Register containing the memory index to be read
                // Argument 2: The target register

                u8 _memoryAddress = *READ_BYTE();
                REGISTER_CHECK(_memoryAddress);
                u8 memoryAddress = registers[ _memoryAddress ];

                u8 target = *READ_BYTE();
                REGISTER_CHECK(target);

                if (memoryTable->table_size < memoryAddress) {
                    registers[ target ] = 0;
                    continue;
                }

                registers[ target ] = memoryTable->array[ memoryAddress ];

                continue;
            }

            case OP_DUMP: { //~ DUMP operator
                // Prints the integer value of a register to console.
                // Argument count: 1
                // Argument 1: The ID of the register to log.

                u8 registerAddress = *READ_BYTE();
                REGISTER_CHECK(registerAddress);
                printf("%lu", registers[ registerAddress ]);

                continue;
            }

            case OP_CHARPRINT: { //~ CHARPRINT operator
                // Prints the string value of a register to console.
                // Argument count: 1
                // Argument 1: The ID of the register to log.

                u8 registerAddress = *READ_BYTE();
                REGISTER_CHECK(registerAddress);
                printf("%c", (u8) registers[ registerAddress ]);

                continue;
            }

            case OP_PRINT: { //~ PRINT operator
                // Prints the string value of a memory address to console, Ends with `\0` or with
                // memory EOF. Argument count: 1 Argument 1: The register containing the memory
                // address to read from.

                u8 _memoryAddress = *READ_BYTE();
                REGISTER_CHECK(_memoryAddress);
                u8 memoryAddress = registers[ _memoryAddress ];
                u8 index         = 0;

                if (memoryTable->table_size < memoryAddress) { continue; }

                u64 arr = memoryTable->array[ memoryAddress + index ];
                while (memoryTable->table_size > memoryAddress + index && arr != 0) {
                    printf("%c", (u8) arr);

                    index++;
                    arr = memoryTable->array[ memoryAddress + index ];
                }

                printf("%c", (u8) arr);

                continue;
            }

            case OP_NULL: { //~ NULL operator
                // Continue execution. Mostly used as a break.

                continue;
            }

            case OP_EXIT: { //~ EXIT operator
                // Peacefully exit the vm
                return VM_EXIT_OK;
            }

            default: { //~ Unknown operator
                // Log error and return error

                printf("Unknown opcode: %i ; Position: %lu\n", instruction, pointerIndex);
                return VM_EXIT_FAILURE;
            }
        }
    }
}

int main(int argc, string *argv) {
    memoryTable             = malloc(sizeof(Table));
    memoryTable->array      = malloc(sizeof(u8) * 1);
    memoryTable->table_size = 1;

    memoryTable->array[ 0 ] = 0;

    if (argc < 2) {
        printf("Usage:\n    %s <filename>\n", argv[ 0 ]);
        return 1;
    }

    File *file = readFile(argv[ 1 ]);
    if (file->size == 0) { return 1; }

    string yolk_header = YOLK_ELF;
    u8     header_size = strlen(yolk_header);

    for (int i = 0; i < header_size; i++) {
        if (file->content[ i ] != yolk_header[ i ]) {
            printf(
                "Invalid or corrupt yolk binary header ('%i' != '%i')\n",
                file->content[ i ],
                yolk_header[ i ]);
            return 912;
        }
    }

    vm(file->content + header_size);

    free(file->content);
    return 0;
}