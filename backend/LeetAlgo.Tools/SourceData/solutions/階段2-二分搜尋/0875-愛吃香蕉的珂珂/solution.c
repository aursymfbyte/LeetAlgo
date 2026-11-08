// 速度越快，吃完要的時間越少，所以「速度 k 能在 h 小時內吃完」是 false...false true...true，要找第一個 true。
// 速度 k 時，一堆 pile 根香蕉要吃 ceil(pile / k) 小時，也就是 (pile - 1) / k + 1。
// 二分答案：用開區間 (left, right)，left = 0 一定吃不完，right = max(piles) 時每堆都一小時吃完，一定吃得完。
// 時間 O(n log U)，U 是最大那堆的香蕉數；空間 O(1)。
bool canFinish(int* piles, int pilesSize, int speed, int h) {
    long long hours = 0;
    for (int i = 0; i < pilesSize; i++) {
        hours += (piles[i] - 1) / speed + 1;
    }
    return hours <= h;
}

int minEatingSpeed(int* piles, int pilesSize, int h) {
    int maxPile = 0;
    for (int i = 0; i < pilesSize; i++) {
        if (piles[i] > maxPile) {
            maxPile = piles[i];
        }
    }

    int left = 0;
    int right = maxPile;
    while (left + 1 < right) {
        int mid = left + (right - left) / 2;
        if (canFinish(piles, pilesSize, mid, h)) {
            right = mid;
        } else {
            left = mid;
        }
    }
    return right;
}
