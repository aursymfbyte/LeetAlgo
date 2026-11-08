// 某個版本之後全部都是壞的，所以 IsBadVersion(1..n) 的結果是 false...false true...true，要找第一個 true。
// 用開區間 (left, right) 二分：left = 0 當成好的版本，right = n 一定是壞的（最新版是壞的），
// 過程中保持 left 是好的、right 是壞的，區間變空時 right 就是第一個壞版本。
// 每次呼叫 IsBadVersion 都讓區間砍半，總共只呼叫 O(log n) 次。
// 時間 O(log n)，空間 O(1)。
public class Solution : VersionControl {
    public int FirstBadVersion(int n) {
        int left = 0;
        int right = n;
        while (left + 1 < right) {
            int mid = left + (right - left) / 2;
            if (IsBadVersion(mid)) {
                right = mid;
            } else {
                left = mid;
            }
        }
        return right;
    }
}
