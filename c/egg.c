#include "hash.c"
#include <stdbool.h>
#include <stdio.h>

typedef char *string;
#define true 1
#define false 0

// TODO
typedef int registry;
typedef int numberMemory;
typedef int stringMemory;
typedef int stackTrace;
typedef int modStorage;

#define table(type) hashTable

struct trace {
	int line;
	string program;
};

typedef struct values {
	bool DEBUG;
	string filename;
	registry *registry;
	table(int) *num_memory;
	table(string) *str_memory;
	table(struct trace) **trace;
	table(struct mod) *moduleStorage;

	string args;
	int i;
	int *stack;
} value;

typedef struct mod {
	string name;
	void ( *factory ) ( value * );
} mod;

int main ( int argc, char **argv ) {
	string code = "echo Hello World!";
	hashTable *table = createTable(200000);

	return 0;
}