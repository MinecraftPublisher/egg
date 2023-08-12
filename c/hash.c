#include <math.h>
#include <stdio.h>
#include <stdlib.h>
typedef char *string;

struct item {
	string key;
	void *value;
};

struct hashTable {
	size_t size;
	size_t arr;
	struct item *items;
};

typedef struct hashTable hashTable;

double hashSize(double size) {
    double output = floor(log((double)size) / log((double)200));
    if(output < 1) return 1;
    else return output;
}

size_t hash ( string str, int size ) {
	size_t i = 0;
    size_t point = hashSize(size);

	for ( int j = 0; str[ j ]; j++ )
		i += str[ j ] * ( j + 1 ) / point;

	return i % size;
}

hashTable *createTable ( size_t size ) {
	hashTable *output = malloc ( sizeof ( hashTable ) );
	output->size = size;
	output->arr = 1;
	output->items = malloc ( sizeof ( struct item ) * output->arr );
	if ( output->items == NULL ) {
		printf ( "Malloc failed at create hash table\n" );
        exit(1);
	}

	return output;
}

void set ( hashTable *table, string key, void *value ) {
	size_t _hash = hash ( key, table->size );
	if ( table->arr < _hash ) {
		table->arr = _hash + 1;
		table->items =
			realloc ( table->items, sizeof ( struct item ) * table->arr );
		if ( table->items == NULL ) {
			printf ( "Realloc failed at set table value\n" );
			exit ( 1 );
		}
	}

    struct item *item = &table->items[_hash];
    if(item->key != key && item->key != NULL) {
        printf("Possible hashtable overlap for keys %s and %s.\n", item->key, key);
    }

    item->key = key;
    item->value = value;
}

void *get(hashTable *table, string key) {
    size_t _hash = hash ( key, table->size );
    if(table->arr < _hash) {
        return NULL;
    } else if(table->items[_hash].key == NULL) {
        return NULL;
    } else {
        return table->items[_hash].value;
    }
}