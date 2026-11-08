// 回溯：path[i] 代表第 i 個數字選了哪個字母，dfs(i) 負責填第 i 格。
// 每一格都把該數字對應的字母試一遍，填滿 n 格就得到一個組合。
// 因為每次都是直接覆蓋 path[i]，不需要額外的「撤銷」動作。
// 時間 O(n·4^n)，空間 O(n)（不計答案）。
class Solution {
private:
    const vector<string> phoneLetters = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

    void dfs(const string& digits, int index, string& path, vector<string>& answer) {
        int n = digits.size();
        if (index == n) {
            answer.push_back(path);
            return;
        }
        for (char letter : phoneLetters[digits[index] - '0']) {
            path[index] = letter;
            dfs(digits, index + 1, path, answer);
        }
    }

public:
    vector<string> letterCombinations(string digits) {
        vector<string> answer;
        string path(digits.size(), ' ');
        dfs(digits, 0, path, answer);
        return answer;
    }
};
