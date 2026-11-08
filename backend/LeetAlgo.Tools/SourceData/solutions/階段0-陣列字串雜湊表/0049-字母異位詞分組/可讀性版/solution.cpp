// 互為異位詞的字串，把字母排序後會變成同一個字串，拿它當雜湊表的鍵來分組。
// 時間 O(n·k log k)，空間 O(n·k)，n 是字串數量，k 是最長字串的長度。
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (string& word : strs) {
            string key = word;
            sort(key.begin(), key.end());
            groups[key].push_back(word);
        }

        vector<vector<string>> result;
        for (auto& entry : groups) {
            result.push_back(entry.second);
        }
        return result;
    }
};
