// 用 nextNumber 表示「大於等於它的整數都還在集合裡、從沒被拿走過」。
// 被拿走後又加回來、而且比 nextNumber 小的數，放進最小堆；另外用布林陣列記錄堆裡有哪些數，避免重複加入。
// popSmallest 時，堆裡的數一定都比 nextNumber 小，所以堆不空就先彈堆頂，否則回傳 nextNumber 並往後移。
// 每次操作 O(log m)，空間 O(1000)，m 是加回來的數字個數。
#define MAX_NUM 1000

typedef struct {
    int nextNumber;
    int heap[MAX_NUM + 1];
    int heapSize;
    bool inHeap[MAX_NUM + 1];
} SmallestInfiniteSet;

void swapValues(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

void heapPush(SmallestInfiniteSet* obj, int value) {
    int child = obj->heapSize;
    obj->heap[child] = value;
    obj->heapSize++;
    while (child > 0) {
        int parent = (child - 1) / 2;
        if (obj->heap[parent] <= obj->heap[child]) {
            break;
        }
        swapValues(&obj->heap[parent], &obj->heap[child]);
        child = parent;
    }
}

int heapPop(SmallestInfiniteSet* obj) {
    int top = obj->heap[0];
    obj->heapSize--;
    obj->heap[0] = obj->heap[obj->heapSize];
    int parent = 0;
    while (true) {
        int left = parent * 2 + 1;
        int right = parent * 2 + 2;
        int smallest = parent;
        if (left < obj->heapSize && obj->heap[left] < obj->heap[smallest]) {
            smallest = left;
        }
        if (right < obj->heapSize && obj->heap[right] < obj->heap[smallest]) {
            smallest = right;
        }
        if (smallest == parent) {
            break;
        }
        swapValues(&obj->heap[parent], &obj->heap[smallest]);
        parent = smallest;
    }
    return top;
}

SmallestInfiniteSet* smallestInfiniteSetCreate() {
    SmallestInfiniteSet* obj = malloc(sizeof(SmallestInfiniteSet));
    obj->nextNumber = 1;
    obj->heapSize = 0;
    for (int i = 0; i <= MAX_NUM; i++) {
        obj->inHeap[i] = false;
    }
    return obj;
}

int smallestInfiniteSetPopSmallest(SmallestInfiniteSet* obj) {
    if (obj->heapSize > 0) {
        int smallest = heapPop(obj);
        obj->inHeap[smallest] = false;
        return smallest;
    }
    int answer = obj->nextNumber;
    obj->nextNumber++;
    return answer;
}

void smallestInfiniteSetAddBack(SmallestInfiniteSet* obj, int num) {
    if (num >= obj->nextNumber || obj->inHeap[num]) {
        return;
    }
    heapPush(obj, num);
    obj->inHeap[num] = true;
}

void smallestInfiniteSetFree(SmallestInfiniteSet* obj) {
    free(obj);
}
