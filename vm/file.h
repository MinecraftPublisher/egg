#ifndef USERS_MARTIA_PROJECTS_EGG_VM_FILE_H
#define USERS_MARTIA_PROJECTS_EGG_VM_FILE_H

#include <stdio.h>
#include <stdlib.h>

#ifndef uint8_t
typedef unsigned char uint8_t;
#endif

typedef uint8_t u8;
typedef char   *string;

typedef struct {
    u8     size;
    string content;
} File;

File *createFile(u8 size, string content) {
    File *newFile    = (File*)malloc(sizeof(File));
    newFile->content = content;
    newFile->size    = size;

    return newFile;
}

File *readFile(string fname) {
    FILE *fp = fopen(fname, "rb");
    if (!fp) {
        (void) fprintf(stderr, "Error opening file: %s.\n", fname);
        return createFile(0, NULL);
    }

    (void) fseek(fp, 0, SEEK_END);
    const int fsize = ftell(fp);

    (void) fseek(fp, 0, SEEK_SET);
    string b = (string)malloc(fsize);

    (void) fread(b, fsize, 1, fp);
    (void) fclose(fp);

    return createFile(fsize, b);
}

File *writeFile(string fname, u8 fsize, string content) {
    FILE *fp = fopen(fname, "wb");

    if (fp == NULL) {
        (void) fprintf(stderr, "Error opening file: %s.\n", fname);
        return createFile(0, NULL);
    }

    for(int i = 0; i < fsize; i++) {
        (void) fprintf(fp, "%c", content[i]);
    }
    (void) fclose(fp);

    return createFile(-1, content);
}


#endif