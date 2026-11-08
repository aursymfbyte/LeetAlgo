// 用一個長度 4 的陣列記錄每種車位還剩幾格，下標直接對應 carType（1 大、2 中、3 小）。
// 停車時看該種車位還有沒有剩，有就減一並回傳 true。
// 每次操作 O(1)，空間 O(1)。
typedef struct {
    int remaining[4];
} ParkingSystem;

ParkingSystem* parkingSystemCreate(int big, int medium, int small) {
    ParkingSystem* obj = malloc(sizeof(ParkingSystem));
    obj->remaining[0] = 0;
    obj->remaining[1] = big;
    obj->remaining[2] = medium;
    obj->remaining[3] = small;
    return obj;
}

bool parkingSystemAddCar(ParkingSystem* obj, int carType) {
    if (obj->remaining[carType] == 0) {
        return false;
    }
    obj->remaining[carType]--;
    return true;
}

void parkingSystemFree(ParkingSystem* obj) {
    free(obj);
}
