// 不真的複製整個陣列，而是讓每一格記錄自己的修改歷史：一串 (snapId, value)，snapId 是修改當下的快照編號。
// set 時，如果這一格最後一筆紀錄的 snapId 就是目前編號，直接覆蓋；否則在尾端新增一筆。
// snap 只要把目前編號加一，並回傳加一前的編號。
// get(index, snap_id) 要找這一格「snapId <= 查詢編號」的最後一筆紀錄：
// 二分搜尋第一個 snapId 大於查詢編號的位置，前一格就是答案；沒有前一格代表從沒改過，值是 0。
// set 均攤 O(1)、snap O(1)，get O(log k)，k 是這一格的紀錄數；空間 O(length + set 的呼叫次數)。
struct Record {
    int snapId;
    int value;
};

struct History {
    struct Record* records;
    int size;
    int capacity;
};

typedef struct {
    struct History* history;
    int length;
    int currentSnapId;
} SnapshotArray;

SnapshotArray* snapshotArrayCreate(int length) {
    SnapshotArray* obj = malloc(sizeof(SnapshotArray));
    obj->history = malloc(sizeof(struct History) * length);
    for (int i = 0; i < length; i++) {
        obj->history[i].records = NULL;
        obj->history[i].size = 0;
        obj->history[i].capacity = 0;
    }
    obj->length = length;
    obj->currentSnapId = 0;
    return obj;
}

void snapshotArraySet(SnapshotArray* obj, int index, int val) {
    struct History* cell = &obj->history[index];
    if (cell->size > 0 && cell->records[cell->size - 1].snapId == obj->currentSnapId) {
        cell->records[cell->size - 1].value = val;
        return;
    }

    if (cell->size == cell->capacity) {
        if (cell->capacity == 0) {
            cell->capacity = 2;
        } else {
            cell->capacity *= 2;
        }
        cell->records = realloc(cell->records, sizeof(struct Record) * cell->capacity);
    }
    cell->records[cell->size].snapId = obj->currentSnapId;
    cell->records[cell->size].value = val;
    cell->size++;
}

int snapshotArraySnap(SnapshotArray* obj) {
    obj->currentSnapId++;
    return obj->currentSnapId - 1;
}

int snapshotArrayGet(SnapshotArray* obj, int index, int snap_id) {
    struct History* cell = &obj->history[index];
    int left = 0;
    int right = cell->size;
    while (left < right) {
        int mid = (left + right) / 2;
        if (cell->records[mid].snapId <= snap_id) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    if (left == 0) {
        return 0;
    }
    return cell->records[left - 1].value;
}

void snapshotArrayFree(SnapshotArray* obj) {
    for (int i = 0; i < obj->length; i++) {
        free(obj->history[i].records);
    }
    free(obj->history);
    free(obj);
}
