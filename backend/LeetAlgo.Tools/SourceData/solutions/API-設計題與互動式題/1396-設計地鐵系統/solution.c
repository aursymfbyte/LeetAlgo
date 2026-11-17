// 用兩個雜湊表：
// checkIns 記錄還在車上的乘客：id -> (進站站名, 進站時間)；
// routes 記錄每條路線的統計：「起點->終點」字串 -> (總花費時間, 趟數)。
// 出站時從 checkIns 取出這位乘客的進站資料，把這趟時間累加到對應路線，再把乘客移除。
// 平均時間就是總時間除以趟數；總時間可能超過 int 範圍，用 long long 存。
// 每個操作 O(1)（不計字串長度），空間 O(乘客數 + 路線數)。
struct CheckInEntry {
    int id;
    char station[11];
    int time;
    UT_hash_handle hh;
};

struct RouteEntry {
    char route[24];
    long long totalTime;
    int tripCount;
    UT_hash_handle hh;
};

typedef struct {
    struct CheckInEntry* checkIns;
    struct RouteEntry* routes;
} UndergroundSystem;

UndergroundSystem* undergroundSystemCreate() {
    UndergroundSystem* obj = malloc(sizeof(UndergroundSystem));
    obj->checkIns = NULL;
    obj->routes = NULL;
    return obj;
}

void undergroundSystemCheckIn(UndergroundSystem* obj, int id, char* stationName, int t) {
    struct CheckInEntry* entry = malloc(sizeof(struct CheckInEntry));
    entry->id = id;
    strcpy(entry->station, stationName);
    entry->time = t;
    HASH_ADD_INT(obj->checkIns, id, entry);
}

void undergroundSystemCheckOut(UndergroundSystem* obj, int id, char* stationName, int t) {
    struct CheckInEntry* checkIn = NULL;
    HASH_FIND_INT(obj->checkIns, &id, checkIn);

    char route[24];
    sprintf(route, "%s->%s", checkIn->station, stationName);
    struct RouteEntry* entry = NULL;
    HASH_FIND_STR(obj->routes, route, entry);
    if (entry == NULL) {
        entry = malloc(sizeof(struct RouteEntry));
        strcpy(entry->route, route);
        entry->totalTime = 0;
        entry->tripCount = 0;
        HASH_ADD_STR(obj->routes, route, entry);
    }
    entry->totalTime += t - checkIn->time;
    entry->tripCount++;

    HASH_DEL(obj->checkIns, checkIn);
    free(checkIn);
}

double undergroundSystemGetAverageTime(UndergroundSystem* obj, char* startStation, char* endStation) {
    char route[24];
    sprintf(route, "%s->%s", startStation, endStation);
    struct RouteEntry* entry = NULL;
    HASH_FIND_STR(obj->routes, route, entry);
    return (double)entry->totalTime / entry->tripCount;
}

void undergroundSystemFree(UndergroundSystem* obj) {
    struct CheckInEntry* currentCheckIn;
    struct CheckInEntry* nextCheckIn;
    HASH_ITER(hh, obj->checkIns, currentCheckIn, nextCheckIn) {
        HASH_DEL(obj->checkIns, currentCheckIn);
        free(currentCheckIn);
    }

    struct RouteEntry* currentRoute;
    struct RouteEntry* nextRoute;
    HASH_ITER(hh, obj->routes, currentRoute, nextRoute) {
        HASH_DEL(obj->routes, currentRoute);
        free(currentRoute);
    }
    free(obj);
}
