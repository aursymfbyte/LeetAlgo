// 二分答案 h：citations 是遞增的，「至少 h 篇論文被引用至少 h 次」等於倒數第 h 篇 citations[n - h] >= h。
// h 越小越容易成立，所以這個條件是 true...true false...false，要找最後一個 true。
// 用開區間 (left, right)，left = 0 一定成立，right = n + 1 一定不成立，區間變空時 left 就是答案。
// 時間 O(log n)，空間 O(1)。
class Solution {
public:
    int hIndex(vector<int>& citations) {
        int n = citations.size();
        int left = 0;
        int right = n + 1;
        while (left + 1 < right) {
            int mid = left + (right - left) / 2;
            if (citations[n - mid] >= mid) {
                left = mid;
            } else {
                right = mid;
            }
        }
        return left;
    }
};
