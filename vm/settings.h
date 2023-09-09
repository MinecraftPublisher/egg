//! Determines whether the VM should check if a register exists before execution or not.
//! It can reduce undefined behavior and garbage values,
//! But may slow down the execution speed in some situations.
#define CHECK_REGISTER_VALUES true

#if CHECK_REGISTER_VALUES == true
    #define REGISTER_CHECK(x)                                                                      \
        if (x > 19) {                                                                              \
            printf("Invalid register '%i' ; Position: %lu\n", x, pointerIndex);                    \
            return VM_EXIT_FAILURE;                                                                \
        }
#else
    #define REGISTER_CHECK(x) ;
#endif