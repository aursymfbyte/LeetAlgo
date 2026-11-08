// 維護一個最多 k 個元素的最小堆，裡面放的是目前最大的 k 個數。
// 每加入一個數就放進堆，堆超過 k 個就把最小的彈掉；堆頂就是第 k 大。
// 建構 O(n log k)，每次 add O(log k)，空間 O(k)。
typedef struct {
    int* heap;
    int size;
    int k;
} KthLargest;

void swapValues(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

void heapPush(KthLargest* obj, int value) {
    int child = obj->size;
    obj->heap[child] = value;
    obj->size++;
    while (child > 0) {
        int parent = (child - 1) / 2;
        if (obj->heap[parent] <= obj->heap[child]) {
            break;
        }
        swapValues(&obj->heap[parent], &obj->heap[child]);
        child = parent;
    }
}

void heapPop(KthLargest* obj) {
    obj->size--;
    obj->heap[0] = obj->heap[obj->size];
    int parent = 0;
    while (true) {
        int left = parent * 2 + 1;
        int right = parent * 2 + 2;
        int smallest = parent;
        if (left < obj->size && obj->heap[left] < obj->heap[smallest]) {
            smallest = left;
        }
        if (right < obj->size && obj->heap[right] < obj->heap[smallest]) {
            smallest = right;
        }
        if (smallest == parent) {
            break;
        }
        swapValues(&obj->heap[parent], &obj->heap[smallest]);
        parent = smallest;
    }
}

int kthLargestAdd(KthLargest* obj, int val) {
    heapPush(obj, val);
    if (obj->size > obj->k) {
        heapPop(obj);
    }
    return obj->heap[0];
}

KthLargest* kthLargestCreate(int k, int* nums, int numsSize) {
    KthLargest* obj = malloc(sizeof(KthLargest));
    obj->heap = malloc(sizeof(int) * (k + 1));
    obj->size = 0;
    obj->k = k;
    for (int i = 0; i < numsSize; i++) {
        kthLargestAdd(obj, nums[i]);
    }
    return obj;
}

void kthLargestFree(KthLargest* obj) {
    free(obj->heap);
    free(obj);
}
