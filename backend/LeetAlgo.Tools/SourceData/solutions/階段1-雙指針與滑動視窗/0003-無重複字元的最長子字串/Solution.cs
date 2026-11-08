// 不定長滑動視窗求最長：右端點每次把 s[right] 加進視窗，並記錄每個字元在視窗裡出現的次數。
// 如果 s[right] 出現超過一次，就一直把左端點的字元移出、左端點右移，直到視窗內沒有重複。
// 此時視窗是以 right 結尾、最長的無重複子字串，用它的長度更新答案。
// 時間 O(n)，空間 O(字元集大小)。
public class Solution {
    public int LengthOfLongestSubstring(string s) {
        int[] count = new int[128];
        int answer = 0;
        int left = 0;
        for (int right = 0; right < s.Length; right++) {
            char c = s[right];
            count[c]++;
            while (count[c] > 1) {
                count[s[left]]--;
                left++;
            }
            answer = Math.Max(answer, right - left + 1);
        }
        return answer;
    }
}
