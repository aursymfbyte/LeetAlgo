// 用一個長度 4 的陣列記錄每種車位還剩幾格，下標直接對應 carType（1 大、2 中、3 小）。
// 停車時看該種車位還有沒有剩，有就減一並回傳 true。
// 每次操作 O(1)，空間 O(1)。
class ParkingSystem {
private:
    int remaining[4];

public:
    ParkingSystem(int big, int medium, int small) {
        remaining[0] = 0;
        remaining[1] = big;
        remaining[2] = medium;
        remaining[3] = small;
    }

    bool addCar(int carType) {
        if (remaining[carType] == 0) {
            return false;
        }
        remaining[carType]--;
        return true;
    }
};
