// 用同一個下標 i 同時走兩個字串，每輪各取一個字元；較短的字串用完後，只取另一個。
// 時間 O(m + n)，空間 O(m + n)。
public class Solution {
    public string MergeAlternately(string word1, string word2) {
        StringBuilder result = new StringBuilder();
        int i = 0;
        while (i < word1.Length || i < word2.Length) {
            if (i < word1.Length) {
                result.Append(word1[i]);
            }
            if (i < word2.Length) {
                result.Append(word2[i]);
            }
            i++;
        }
        return result.ToString();
    }
}
