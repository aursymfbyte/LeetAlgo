// 回溯（枚舉這一段切到哪裡）：dfs(start) 表示 s[start..] 還沒切。
// 枚舉這一段的結尾 end，只有 s[start..end] 是回文才切下來放進 path，再從 end + 1 繼續切。
// start 走到字串尾端時，path 就是一種切法；遞迴回來後把這一段拿掉（恢復現場）。
// 時間 O(n·2^n)，空間 O(n)（不計答案）。
class Solution {
private:
    bool isPalindrome(const string& s, int left, int right) {
        while (left < right) {
            if (s[left] != s[right]) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }

    void dfs(const string& s, int start, vector<string>& path, vector<vector<string>>& answer) {
        int n = s.size();
        if (start == n) {
            answer.push_back(path);
            return;
        }
        for (int end = start; end < n; end++) {
            if (isPalindrome(s, start, end)) {
                path.push_back(s.substr(start, end - start + 1));
                dfs(s, end + 1, path, answer);
                path.pop_back();
            }
        }
    }

public:
    vector<vector<string>> partition(string s) {
        vector<vector<string>> answer;
        vector<string> path;
        dfs(s, 0, path, answer);
        return answer;
    }
};
