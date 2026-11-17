// 三次二分：
// 第一次找山頂：若 arr[mid] < arr[mid + 1]，山頂在 mid 右邊，否則山頂在 mid 或它左邊。
// 第二次在山頂左側的遞增段 [0, peak] 找 target，找到就是最小下標，直接回傳。
// 第三次才在山頂右側的遞減段 [peak + 1, n - 1] 找，遞減段的二分方向要反過來。
// n 最多 10^4，三次二分合計約 2 * 14 + 14 + 14 = 56 次 get，不超過 100 次。
// 時間 O(log n)，空間 O(1)。
int searchRange(MountainArray* mountainArr, int target, int left, int right, bool ascending) {
    while (left <= right) {
        int mid = (left + right) / 2;
        int value = get(mountainArr, mid);
        if (value == target) {
            return mid;
        }
        if (ascending) {
            if (value < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        } else {
            if (value > target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    return -1;
}

int findInMountainArray(int target, MountainArray* mountainArr) {
    int n = length(mountainArr);

    int left = 0;
    int right = n - 1;
    while (left < right) {
        int mid = (left + right) / 2;
        if (get(mountainArr, mid) < get(mountainArr, mid + 1)) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    int peak = left;

    int index = searchRange(mountainArr, target, 0, peak, true);
    if (index != -1) {
        return index;
    }
    return searchRange(mountainArr, target, peak + 1, n - 1, false);
}
