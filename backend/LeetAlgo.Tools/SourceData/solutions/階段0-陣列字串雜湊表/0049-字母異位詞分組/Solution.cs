// 互為異位詞的字串，26 個字母各自出現的次數一定完全相同。
// 數出每個字串裡 26 個字母的出現次數，拿這組次數當雜湊表的鍵來分組，就不用排序字串。
// 時間 O(n·(k + 26))，空間 O(n·(k + 26))，n 是字串數量，k 是最長字串的長度。
public class Solution {
    public IList<IList<string>> GroupAnagrams(string[] strs) {
        Dictionary<string, List<string>> groups = new Dictionary<string, List<string>>();
        foreach (string word in strs) {
            char[] counts = new char[26];
            foreach (char letter in word) {
                counts[letter - 'a']++;
            }
            string key = new string(counts);

            if (!groups.ContainsKey(key)) {
                groups[key] = new List<string>();
            }
            groups[key].Add(word);
        }

        List<IList<string>> result = new List<IList<string>>();
        foreach (List<string> group in groups.Values) {
            result.Add(group);
        }
        return result;
    }
}
