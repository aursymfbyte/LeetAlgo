// 用同一個下標 i 同時走兩個字串，每輪各取一個字元；較短的字串用完後，只取另一個。
// 時間 O(m + n)，空間 O(m + n)。
class Solution {
public:
    string mergeAlternately(string word1, string word2) {
        string result;
        int length1 = word1.size();
        int length2 = word2.size();
        int i = 0;
        while (i < length1 || i < length2) {
            if (i < length1) {
                result += word1[i];
            }
            if (i < length2) {
                result += word2[i];
            }
            i++;
        }
        return result;
    }
};
