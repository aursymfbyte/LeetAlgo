// 用長度 26 的陣列計數：s 的字母加一、t 的字母減一，最後全部歸零才是異位詞。
// 時間 O(n)，空間 O(1)。
class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) {
            return false;
        }

        int count[26] = {0};
        for (char ch : s) {
            count[ch - 'a']++;
        }
        for (char ch : t) {
            count[ch - 'a']--;
        }

        for (int value : count) {
            if (value != 0) {
                return false;
            }
        }
        return true;
    }
};
