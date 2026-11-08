// 回溯：path[i] 代表第 i 個數字選了哪個字母，Dfs(i) 負責填第 i 格。
// 每一格都把該數字對應的字母試一遍，填滿 n 格就得到一個組合。
// 因為每次都是直接覆蓋 path[i]，不需要額外的「撤銷」動作。
// 時間 O(n·4^n)，空間 O(n)（不計答案）。
public class Solution {
    private static readonly string[] PhoneLetters = { "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz" };

    public IList<string> LetterCombinations(string digits) {
        List<string> answer = new List<string>();
        char[] path = new char[digits.Length];
        Dfs(digits, 0, path, answer);
        return answer;
    }

    private void Dfs(string digits, int index, char[] path, List<string> answer) {
        if (index == digits.Length) {
            answer.Add(new string(path));
            return;
        }
        foreach (char letter in PhoneLetters[digits[index] - '0']) {
            path[index] = letter;
            Dfs(digits, index + 1, path, answer);
        }
    }
}
