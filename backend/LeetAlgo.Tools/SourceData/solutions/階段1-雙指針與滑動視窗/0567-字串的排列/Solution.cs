// s1 的某個排列是 s2 的子字串，等於 s2 裡有一段長度為 s1.Length、字母計數跟 s1 完全相同的視窗（跟 438 題一樣）。
// 用定長滑動視窗維護 26 個字母的計數，每一步：進 s2[right]；長度到了就比對計數，相同直接回傳 true；出 s2[left]。
// 時間 O(26n)，空間 O(26)。
public class Solution {
    public bool CheckInclusion(string s1, string s2) {
        int[] targetCount = new int[26];
        foreach (char c in s1) {
            targetCount[c - 'a']++;
        }

        int[] windowCount = new int[26];
        int windowSize = s1.Length;
        for (int right = 0; right < s2.Length; right++) {
            windowCount[s2[right] - 'a']++;
            int left = right - windowSize + 1;
            if (left < 0) {
                continue;
            }
            if (windowCount.SequenceEqual(targetCount)) {
                return true;
            }
            windowCount[s2[left] - 'a']--;
        }
        return false;
    }
}
