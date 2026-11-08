// 劃分型 DP：f[i] 表示 s 的前 i 個字元能不能拆成字典裡的單字，f[0] = true（空字串）。
// 枚舉最後一段是哪個單字 word：如果前 i 個字元剛好以 word 結尾，且 f[i - word.size()] 為真，f[i] 就為真。
// 時間 O(n · D · L)，n 是 s 的長度、D 是單字數、L 是單字最大長度；空間 O(n)。
class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        int n = s.size();
        vector<bool> f(n + 1, false);
        f[0] = true;
        for (int i = 1; i <= n; i++) {
            for (const string& word : wordDict) {
                int wordLength = word.size();
                int start = i - wordLength;
                if (start >= 0 && f[start] && s.substr(start, wordLength) == word) {
                    f[i] = true;
                    break;
                }
            }
        }
        return f[n];
    }
};
