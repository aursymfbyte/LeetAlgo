// 用長度 26 的陣列計數：s 的字母加一、t 的字母減一，最後全部歸零才是異位詞。
// 時間 O(n)，空間 O(1)。
public class Solution {
    public bool IsAnagram(string s, string t) {
        if (s.Length != t.Length) {
            return false;
        }

        int[] count = new int[26];
        foreach (char ch in s) {
            count[ch - 'a']++;
        }
        foreach (char ch in t) {
            count[ch - 'a']--;
        }

        foreach (int value in count) {
            if (value != 0) {
                return false;
            }
        }
        return true;
    }
}
