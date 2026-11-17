// 對頂堆：較小的一半放在最大堆 lower，較大的一半放在最小堆 upper，
// 並維持 lower 的個數等於 upper，或比 upper 多 1。
// 加入新數時先放進 lower，再把 lower 最大的移到 upper，保證 lower 的數都不大於 upper 的數；
// 若 upper 因此比 lower 多，再把 upper 最小的移回 lower。
// 中位數就是 lower 的堆頂（總數為奇數），或兩個堆頂的平均（總數為偶數）。
// addNum O(log n)，findMedian O(1)，空間 O(n)。
#define MAX_CALLS 50000

typedef struct {
    int* data;
    int size;
} MinHeap;

typedef struct {
    MinHeap lower;
    MinHeap upper;
} MedianFinder;

void swapValues(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

void heapPush(MinHeap* heap, int value) {
    int child = heap->size;
    heap->data[child] = value;
    heap->size++;
    while (child > 0) {
        int parent = (child - 1) / 2;
        if (heap->data[parent] <= heap->data[child]) {
            break;
        }
        swapValues(&heap->data[parent], &heap->data[child]);
        child = parent;
    }
}

int heapPop(MinHeap* heap) {
    int top = heap->data[0];
    heap->size--;
    heap->data[0] = heap->data[heap->size];
    int parent = 0;
    while (true) {
        int left = parent * 2 + 1;
        int right = parent * 2 + 2;
        int smallest = parent;
        if (left < heap->size && heap->data[left] < heap->data[smallest]) {
            smallest = left;
        }
        if (right < heap->size && heap->data[right] < heap->data[smallest]) {
            smallest = right;
        }
        if (smallest == parent) {
            break;
        }
        swapValues(&heap->data[parent], &heap->data[smallest]);
        parent = smallest;
    }
    return top;
}

MedianFinder* medianFinderCreate() {
    MedianFinder* obj = malloc(sizeof(MedianFinder));
    obj->lower.data = malloc(sizeof(int) * (MAX_CALLS + 1));
    obj->lower.size = 0;
    obj->upper.data = malloc(sizeof(int) * (MAX_CALLS + 1));
    obj->upper.size = 0;
    return obj;
}

void medianFinderAddNum(MedianFinder* obj, int num) {
    heapPush(&obj->lower, -num);
    int largestOfLower = -heapPop(&obj->lower);
    heapPush(&obj->upper, largestOfLower);
    if (obj->upper.size > obj->lower.size) {
        int smallestOfUpper = heapPop(&obj->upper);
        heapPush(&obj->lower, -smallestOfUpper);
    }
}

double medianFinderFindMedian(MedianFinder* obj) {
    int lowerTop = -obj->lower.data[0];
    if (obj->lower.size > obj->upper.size) {
        return lowerTop;
    }
    return (lowerTop + obj->upper.data[0]) / 2.0;
}

void medianFinderFree(MedianFinder* obj) {
    free(obj->lower.data);
    free(obj->upper.data);
    free(obj);
}
