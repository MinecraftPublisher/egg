#ifndef USERS_MARTIA_PROJECTS_EGG_VM_TABLE_H
#define USERS_MARTIA_PROJECTS_EGG_VM_TABLE_H

#include <stdlib.h>

#ifndef uint8_t
typedef unsigned char uint8_t;
#endif

typedef unsigned long uint64_t;
typedef uint64_t      u64;

typedef char   *string;
typedef uint8_t u8;

enum TABLE_TYPE { TABLE_NUMBER, TABLE_STRING };

typedef struct Table {
    u64 *array;
    u64  table_size;
} Table;

#endif
