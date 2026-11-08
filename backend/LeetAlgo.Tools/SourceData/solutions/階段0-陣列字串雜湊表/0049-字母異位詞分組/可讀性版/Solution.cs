// 互為異位詞的字串，把字母排序後會變成同一個字串，拿它當雜湊表的鍵來分組。
// 時間 O(n·k log k)，空間 O(n·k)，n 是字串數量，k 是最長字串的長度。
public class Solution {
    public IList<IList<string>> GroupAnagrams(string[] strs) {
        Dictionary<string, List<string>> groups = new Dictionary<string, List<string>>();
        foreach (string word in strs) {
            char[] letters = word.ToCharArray();
            Array.Sort(letters);
            string key = new string(letters);

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
