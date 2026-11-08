// 單調堆疊：堆疊裡放之前的價格和它的跨度，由底到頂價格嚴格遞減。
// 今天的價格進來時，頂端只要 <= 今天，它涵蓋的那些天也都 <= 今天，
// 就把它的跨度加到今天身上再彈出，直到遇到比今天高的價格為止，最後把今天放進堆疊。
// 每個價格最多進出堆疊一次，next 均攤 O(1)，空間 O(n)。
#define MAX_CALLS 10000

typedef struct {
    int* prices;
    int* spans;
    int size;
} StockSpanner;

StockSpanner* stockSpannerCreate() {
    StockSpanner* obj = malloc(sizeof(StockSpanner));
    obj->prices = malloc(sizeof(int) * MAX_CALLS);
    obj->spans = malloc(sizeof(int) * MAX_CALLS);
    obj->size = 0;
    return obj;
}

int stockSpannerNext(StockSpanner* obj, int price) {
    int span = 1;
    while (obj->size > 0 && obj->prices[obj->size - 1] <= price) {
        obj->size--;
        span += obj->spans[obj->size];
    }
    obj->prices[obj->size] = price;
    obj->spans[obj->size] = span;
    obj->size++;
    return span;
}

void stockSpannerFree(StockSpanner* obj) {
    free(obj->prices);
    free(obj->spans);
    free(obj);
}
