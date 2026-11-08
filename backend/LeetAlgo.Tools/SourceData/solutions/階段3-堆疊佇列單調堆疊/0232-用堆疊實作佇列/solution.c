// 用兩個堆疊：push 一律放進 inStack；要取最前面的元素時，從 outStack 的頂端拿。
// outStack 空了才把 inStack 全部倒過去，倒過去後順序剛好反轉，最早進來的就在頂端。
// 每個元素最多被搬一次，所以每個操作均攤 O(1)，空間 O(n)。
#define MAX_CALLS 100

typedef struct {
    int inStack[MAX_CALLS];
    int inSize;
    int outStack[MAX_CALLS];
    int outSize;
} MyQueue;

MyQueue* myQueueCreate() {
    MyQueue* obj = malloc(sizeof(MyQueue));
    obj->inSize = 0;
    obj->outSize = 0;
    return obj;
}

void moveIfNeeded(MyQueue* obj) {
    if (obj->outSize == 0) {
        while (obj->inSize > 0) {
            obj->inSize--;
            obj->outStack[obj->outSize] = obj->inStack[obj->inSize];
            obj->outSize++;
        }
    }
}

void myQueuePush(MyQueue* obj, int x) {
    obj->inStack[obj->inSize] = x;
    obj->inSize++;
}

int myQueuePop(MyQueue* obj) {
    moveIfNeeded(obj);
    obj->outSize--;
    return obj->outStack[obj->outSize];
}

int myQueuePeek(MyQueue* obj) {
    moveIfNeeded(obj);
    return obj->outStack[obj->outSize - 1];
}

bool myQueueEmpty(MyQueue* obj) {
    return obj->inSize == 0 && obj->outSize == 0;
}

void myQueueFree(MyQueue* obj) {
    free(obj);
}
