// s1 的某個排列是 s2 的子字串，等於 s2 裡有一段長度為 s1.size()、字母計數跟 s1 完全相同的視窗（跟 438 題一樣）。
// 用定長滑動視窗維護 26 個字母的計數，每一步：進 s2[right]；長度到了就比對計數，相同直接回傳 true；出 s2[left]。
// 時間 O(26n)，空間 O(26)。
class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        vector<int> targetCount(26, 0);
        for (char c : s1) {
            targetCount[c - 'a']++;
        }

        vector<int> windowCount(26, 0);
        int windowSize = s1.size();
        int n = s2.size();
        for (int right = 0; right < n; right++) {
            windowCount[s2[right] - 'a']++;
            int left = right - windowSize + 1;
            if (left < 0) {
                continue;
            }
            if (windowCount == targetCount) {
                return true;
            }
            windowCount[s2[left] - 'a']--;
        }
        return false;
    }
};
