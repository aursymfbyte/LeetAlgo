// 異位詞就是每個字母出現次數都一樣，所以用長度固定為 p.Length 的滑動視窗，維護視窗內 26 個字母的計數。
// 每一步：進：s[right] 計數加一；更新：視窗長度到 p.Length 時，計數跟 p 的計數完全相同就記下左端點；出：s[left] 計數減一。
// 時間 O(26n)，空間 O(26)。
public class Solution {
    public IList<int> FindAnagrams(string s, string p) {
        int[] targetCount = new int[26];
        foreach (char c in p) {
            targetCount[c - 'a']++;
        }

        int[] windowCount = new int[26];
        int windowSize = p.Length;
        IList<int> answer = new List<int>();
        for (int right = 0; right < s.Length; right++) {
            windowCount[s[right] - 'a']++;
            int left = right - windowSize + 1;
            if (left < 0) {
                continue;
            }
            if (windowCount.SequenceEqual(targetCount)) {
                answer.Add(left);
            }
            windowCount[s[left] - 'a']--;
        }
        return answer;
    }
}
