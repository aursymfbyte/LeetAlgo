// 除了存放元素的堆疊 values，再開一個同步的堆疊 mins：
// mins 的每一層記錄「從底部到這一層為止的最小值」，push 和 pop 時兩個堆疊一起動。
// 這樣不管彈出多少次，mins 的頂端永遠是目前堆疊裡的最小值。
// 每個操作 O(1)，空間 O(n)。
#define MAX_CALLS 30000

typedef struct {
    int* values;
    int* mins;
    int size;
} MinStack;

MinStack* minStackCreate() {
    MinStack* obj = malloc(sizeof(MinStack));
    obj->values = malloc(sizeof(int) * MAX_CALLS);
    obj->mins = malloc(sizeof(int) * MAX_CALLS);
    obj->size = 0;
    return obj;
}

void minStackPush(MinStack* obj, int value) {
    obj->values[obj->size] = value;
    if (obj->size == 0 || value < obj->mins[obj->size - 1]) {
        obj->mins[obj->size] = value;
    } else {
        obj->mins[obj->size] = obj->mins[obj->size - 1];
    }
    obj->size++;
}

void minStackPop(MinStack* obj) {
    obj->size--;
}

int minStackTop(MinStack* obj) {
    return obj->values[obj->size - 1];
}

int minStackGetMin(MinStack* obj) {
    return obj->mins[obj->size - 1];
}

void minStackFree(MinStack* obj) {
    free(obj->values);
    free(obj->mins);
    free(obj);
}
