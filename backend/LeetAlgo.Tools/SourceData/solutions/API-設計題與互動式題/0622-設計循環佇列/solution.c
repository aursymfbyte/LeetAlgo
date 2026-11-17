// 用長度 k 的陣列當成一個環，記錄隊首下標 head 和目前元素個數 count。
// 隊尾的下一格是 (head + count) % k，隊尾元素在 (head + count - 1) % k。
// 用 count 判斷空和滿，就不用特地空出一格來區分兩種狀態。
// 每個操作都是 O(1)，空間 O(k)。
typedef struct {
    int* items;
    int capacity;
    int head;
    int count;
} MyCircularQueue;

MyCircularQueue* myCircularQueueCreate(int k) {
    MyCircularQueue* obj = malloc(sizeof(MyCircularQueue));
    obj->items = malloc(sizeof(int) * k);
    obj->capacity = k;
    obj->head = 0;
    obj->count = 0;
    return obj;
}

bool myCircularQueueIsEmpty(MyCircularQueue* obj) {
    return obj->count == 0;
}

bool myCircularQueueIsFull(MyCircularQueue* obj) {
    return obj->count == obj->capacity;
}

bool myCircularQueueEnQueue(MyCircularQueue* obj, int value) {
    if (myCircularQueueIsFull(obj)) {
        return false;
    }
    int tail = (obj->head + obj->count) % obj->capacity;
    obj->items[tail] = value;
    obj->count++;
    return true;
}

bool myCircularQueueDeQueue(MyCircularQueue* obj) {
    if (myCircularQueueIsEmpty(obj)) {
        return false;
    }
    obj->head = (obj->head + 1) % obj->capacity;
    obj->count--;
    return true;
}

int myCircularQueueFront(MyCircularQueue* obj) {
    if (myCircularQueueIsEmpty(obj)) {
        return -1;
    }
    return obj->items[obj->head];
}

int myCircularQueueRear(MyCircularQueue* obj) {
    if (myCircularQueueIsEmpty(obj)) {
        return -1;
    }
    int rear = (obj->head + obj->count - 1) % obj->capacity;
    return obj->items[rear];
}

void myCircularQueueFree(MyCircularQueue* obj) {
    free(obj->items);
    free(obj);
}
