// 速度越快，吃完要的時間越少，所以「速度 k 能在 h 小時內吃完」是 false...false true...true，要找第一個 true。
// 速度 k 時，一堆 pile 根香蕉要吃 ceil(pile / k) 小時，也就是 (pile - 1) / k + 1。
// 二分答案：用開區間 (left, right)，left = 0 一定吃不完，right = max(piles) 時每堆都一小時吃完，一定吃得完。
// 時間 O(n log U)，U 是最大那堆的香蕉數；空間 O(1)。
public class Solution {
    public int MinEatingSpeed(int[] piles, int h) {
        int left = 0;
        int right = piles.Max();
        while (left + 1 < right) {
            int mid = left + (right - left) / 2;
            if (CanFinish(piles, mid, h)) {
                right = mid;
            } else {
                left = mid;
            }
        }
        return right;
    }

    private bool CanFinish(int[] piles, int speed, int h) {
        long hours = 0;
        foreach (int pile in piles) {
            hours += (pile - 1) / speed + 1;
        }
        return hours <= h;
    }
}
