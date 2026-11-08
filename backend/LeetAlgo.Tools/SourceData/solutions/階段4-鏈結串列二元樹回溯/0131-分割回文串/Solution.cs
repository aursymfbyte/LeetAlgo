// 回溯（枚舉這一段切到哪裡）：Dfs(start) 表示 s[start..] 還沒切。
// 枚舉這一段的結尾 end，只有 s[start..end] 是回文才切下來放進 path，再從 end + 1 繼續切。
// start 走到字串尾端時，path 就是一種切法；遞迴回來後把這一段拿掉（恢復現場）。
// 時間 O(n·2^n)，空間 O(n)（不計答案）。
public class Solution {
    public IList<IList<string>> Partition(string s) {
        IList<IList<string>> answer = new List<IList<string>>();
        List<string> path = new List<string>();
        Dfs(s, 0, path, answer);
        return answer;
    }

    private void Dfs(string s, int start, List<string> path, IList<IList<string>> answer) {
        if (start == s.Length) {
            answer.Add(new List<string>(path));
            return;
        }
        for (int end = start; end < s.Length; end++) {
            if (IsPalindrome(s, start, end)) {
                path.Add(s.Substring(start, end - start + 1));
                Dfs(s, end + 1, path, answer);
                path.RemoveAt(path.Count - 1);
            }
        }
    }

    private bool IsPalindrome(string s, int left, int right) {
        while (left < right) {
            if (s[left] != s[right]) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}
