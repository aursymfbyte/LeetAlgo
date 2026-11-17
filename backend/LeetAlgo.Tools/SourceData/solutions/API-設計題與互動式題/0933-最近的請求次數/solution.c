// 用佇列當滑動視窗，依時間順序存下每次請求。
// 因為 t 嚴格遞增，比 t - 3000 還早的請求以後也不會再落入視窗，可以直接從隊首丟掉，
// 丟完之後佇列的長度就是答案。
// 每個請求只進出佇列各一次，均攤每次 O(1)；空間 O(q)，q 是 ping 的呼叫次數。
#define MAX_CALLS 10000

typedef struct {
    int requests[MAX_CALLS];
    int head;
    int tail;
} RecentCounter;

RecentCounter* recentCounterCreate() {
    RecentCounter* obj = malloc(sizeof(RecentCounter));
    obj->head = 0;
    obj->tail = 0;
    return obj;
}

int recentCounterPing(RecentCounter* obj, int t) {
    obj->requests[obj->tail] = t;
    obj->tail++;
    while (obj->requests[obj->head] < t - 3000) {
        obj->head++;
    }
    return obj->tail - obj->head;
}

void recentCounterFree(RecentCounter* obj) {
    free(obj);
}
