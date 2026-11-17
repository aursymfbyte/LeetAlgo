// 用一個陣列依序存瀏覽過的網址，current 是目前所在的位置，last 是還能往前走到的最後位置。
// visit 時把網址寫在 current + 1，並把 last 設成新的 current，等於丟掉原本的前進紀錄。
// back / forward 只要移動 current，並夾在 0 和 last 之間。
// 每個操作都是 O(1)，空間 O(n)。
#define MAX_PAGES 5001
#define MAX_URL_LENGTH 21

typedef struct {
    char history[MAX_PAGES][MAX_URL_LENGTH];
    int current;
    int last;
} BrowserHistory;

BrowserHistory* browserHistoryCreate(char* homepage) {
    BrowserHistory* obj = malloc(sizeof(BrowserHistory));
    strcpy(obj->history[0], homepage);
    obj->current = 0;
    obj->last = 0;
    return obj;
}

void browserHistoryVisit(BrowserHistory* obj, char* url) {
    obj->current++;
    strcpy(obj->history[obj->current], url);
    obj->last = obj->current;
}

char* browserHistoryBack(BrowserHistory* obj, int steps) {
    obj->current -= steps;
    if (obj->current < 0) {
        obj->current = 0;
    }
    return obj->history[obj->current];
}

char* browserHistoryForward(BrowserHistory* obj, int steps) {
    obj->current += steps;
    if (obj->current > obj->last) {
        obj->current = obj->last;
    }
    return obj->history[obj->current];
}

void browserHistoryFree(BrowserHistory* obj) {
    free(obj);
}
