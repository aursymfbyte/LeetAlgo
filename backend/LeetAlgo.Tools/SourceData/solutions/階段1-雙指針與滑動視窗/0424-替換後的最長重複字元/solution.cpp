// 一段子字串能全部換成同一個字母的條件：視窗長度 - 視窗內出現最多的字母個數 <= k（其餘字母都換掉）。
// 不定長滑動視窗求最長：右端點每進一個字母，就更新它的計數和 maxCount；條件不成立就移出左端點的字母。
// maxCount 在左端點右移時不用調小：答案要變長，一定要出現更大的 maxCount，
// 用舊的 maxCount 只會讓視窗維持原長度往右滑，不會算出錯誤的更長答案。
// 時間 O(n)，空間 O(26)。
class Solution {
public:
    int characterReplacement(string s, int k) {
        vector<int> count(26, 0);
        int maxCount = 0;
        int answer = 0;
        int left = 0;
        int n = s.size();
        for (int right = 0; right < n; right++) {
            int index = s[right] - 'A';
            count[index]++;
            maxCount = max(maxCount, count[index]);
            while (right - left + 1 - maxCount > k) {
                count[s[left] - 'A']--;
                left++;
            }
            answer = max(answer, right - left + 1);
        }
        return answer;
    }
};
