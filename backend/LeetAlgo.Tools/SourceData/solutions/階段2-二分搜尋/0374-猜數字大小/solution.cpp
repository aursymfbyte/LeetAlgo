// guess(mid) <= 0 代表 mid >= pick，這個條件在 1..n 上是 false...false true...true，第一個 true 就是 pick。
// 用開區間 (left, right) 二分：left = 0 一定 < pick，right = n 一定 >= pick。
// guess(mid) <= 0 就把 right 移到 mid，否則（回傳 1，猜得太小）把 left 移到 mid，區間變空時 right 就是 pick。
// 時間 O(log n)，空間 O(1)。
class Solution {
public:
    int guessNumber(int n) {
        int left = 0;
        int right = n;
        while (left + 1 < right) {
            int mid = left + (right - left) / 2;
            if (guess(mid) <= 0) {
                right = mid;
            } else {
                left = mid;
            }
        }
        return right;
    }
};
