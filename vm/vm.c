#include "file.h"
#include "table.h"
#include "yolk_header.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef char *string;

enum VM_EXIT_STATUS { VM_EXIT_OK, VM_EXIT_EOF, VM_EXIT_FAILURE };

enum OPCODE {
    OP_NULL,   //!
    OP_EXIT,   //!
    OP_PRINT1, //!
    OP_STORE,  //!
    OP_LOAD,   //!
    OP_CONST,  //!
    OP_DUMP,   //!
    OP_WRITE,  //!
    OP_PRINT   //!
};

typedef uint8_t u8;

#define READ_BYTE() (&pointer[ pointerIndex++ ])

Table *memoryTable;

enum VM_EXIT_STATUS vm(string code) {
    // initialize pointer
    string pointer      = code;
    int    pointerIndex = 0;

    // initialize registers
    u8 registers[ 20 ] = {};

    for (;;) {
        u8 *op = (u8 *) READ_BYTE();

        if (op == NULL) {
            // VM has reached end of file, Exit the program.
            return VM_EXIT_EOF;
        }

        enum OPCODE instruction = *op;
        // printf("Got instruction %i at %i\n", instruction, pointerIndex);
        switch (instruction) {
            case OP_CONST: { //~ CONST operator
                // Puts an integer value inside of a register.
                // Argument count: 2+
                // Argument 1: Register to put the constant in
                // Arguments 2..n: The numbers to add up together and place in the register, Ends
                // with `\0`.

                u8 _register = *READ_BYTE();
                u8 output    = 0;
                u8 read      = *READ_BYTE();

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

                u8 memoryAddress = registers[ *READ_BYTE() ];
                u8 index         = 0;

                u8 read = *READ_BYTE();

                while (read != 0) {
                    // reallocate space
                    if (memoryTable->table_size < memoryAddress + index) {
                        memoryTable->array
                            = realloc(memoryTable->array, sizeof(u8) * (memoryAddress + index));
                        memoryTable->table_size = memoryAddress + index;
                    }

                    // write data to storage
                    memoryTable->array[ memoryAddress + index ] = read;

                    // read next byte
                    read = *READ_BYTE();
                    index++;
                }

                continue;
            }

            case OP_STORE: { //~ STORE operator
                // Puts the value of a register into the selected memory address.
                // Argument count: 2
                // Argument 1: Register containing memory index to place the value in
                // Argument 2: Register containing the data to put in memory

                u8 memoryDestination = registers[ *READ_BYTE() ];
                u8 value             = registers[ *READ_BYTE() ];

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

                u8 memoryAddress = registers[ *READ_BYTE() ];
                u8 target        = *READ_BYTE();

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

                printf("%i", registers[ *READ_BYTE() ]);

                continue;
            }

            case OP_PRINT1: { //~ PRINT1 operator
                // Prints the string value of a register to console.
                // Argument count: 1
                // Argument 1: The ID of the register to log.

                printf("%c", registers[ *READ_BYTE() ]);

                continue;
            }

            case OP_PRINT: { //~ PRINT operator
                // Prints the string value of a memory address to console, Ends with `\0` or with
                // memory EOF. Argument count: 1 Argument 1: The register containing the memory
                // address to read from.

                u8 memoryAddress = registers[ *READ_BYTE() ];
                u8 index         = 0;

                if (memoryTable->table_size < memoryAddress) {
                    printf("tebel %i\n", memoryTable->table_size);
                    continue;
                }

                while (memoryTable->table_size > memoryAddress + index) {
                    printf("%c", memoryTable->array[ memoryAddress + index ]);

                    index++;
                }

                printf("%c", memoryTable->array[ memoryAddress + index ]);

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

                printf("Unknown opcode: %i ; Position: %i\n", instruction, pointerIndex);
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
    u8     header_size = (sizeof(yolk_header) / sizeof(char)) - 1;

    for (int i = 0; i < header_size; i++) {
        if (file->content[ i ] != yolk_header[ i ]) {
            printf("Invalid or corrupt yolk binary header ('%i' != '%i')\n", file->content[i], yolk_header[i]);
            return 912;
        }
    }

    vm(file->content + header_size);

    free(file->content);
    return 0;
}