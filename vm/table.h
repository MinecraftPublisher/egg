#ifndef USERS_MARTIA_PROJECTS_EGG_VM_TABLE_H
#define USERS_MARTIA_PROJECTS_EGG_VM_TABLE_H

#include <stdlib.h>

typedef char *string;
typedef uint8_t u8;

enum TABLE_TYPE { TABLE_NUMBER, TABLE_STRING };

typedef struct Table {
    u8 *array;
    u8     table_size;
} Table;

#endif
