// 異位詞就是每個字母出現次數都一樣，所以用長度固定為 p.size() 的滑動視窗，維護視窗內 26 個字母的計數。
// 每一步：進：s[right] 計數加一；更新：視窗長度到 p.size() 時，計數跟 p 的計數完全相同就記下左端點；出：s[left] 計數減一。
// 時間 O(26n)，空間 O(26)。
class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        vector<int> targetCount(26, 0);
        for (char c : p) {
            targetCount[c - 'a']++;
        }

        vector<int> windowCount(26, 0);
        int windowSize = p.size();
        int n = s.size();
        vector<int> answer;
        for (int right = 0; right < n; right++) {
            windowCount[s[right] - 'a']++;
            int left = right - windowSize + 1;
            if (left < 0) {
                continue;
            }
            if (windowCount == targetCount) {
                answer.push_back(left);
            }
            windowCount[s[left] - 'a']--;
        }
        return answer;
    }
};
