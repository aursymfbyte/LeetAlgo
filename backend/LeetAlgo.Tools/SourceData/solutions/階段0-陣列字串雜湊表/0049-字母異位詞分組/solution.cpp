// 互為異位詞的字串，26 個字母各自出現的次數一定完全相同。
// 數出每個字串裡 26 個字母的出現次數，拿這組次數當雜湊表的鍵來分組，就不用排序字串。
// 時間 O(n·(k + 26))，空間 O(n·(k + 26))，n 是字串數量，k 是最長字串的長度。
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (string& word : strs) {
            string counts(26, 0);
            for (char letter : word) {
                counts[letter - 'a']++;
            }
            groups[counts].push_back(word);
        }

        vector<vector<string>> result;
        for (auto& entry : groups) {
            result.push_back(entry.second);
        }
        return result;
    }
};
