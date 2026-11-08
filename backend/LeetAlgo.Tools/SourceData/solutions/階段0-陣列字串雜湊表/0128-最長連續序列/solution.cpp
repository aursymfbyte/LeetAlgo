// 把數字放進集合。只有當 num - 1 不在集合裡時，num 才是一段連續序列的起點，
// 從起點往上數 num + 1、num + 2…… 直到中斷。每個數最多被數到一次。
// 時間 O(n)，空間 O(n)。
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> numSet(nums.begin(), nums.end());
        int longest = 0;
        for (int num : numSet) {
            if (numSet.count(num - 1) > 0) {
                continue;
            }

            int current = num;
            int length = 1;
            while (numSet.count(current + 1) > 0) {
                current++;
                length++;
            }
            longest = max(longest, length);
        }
        return longest;
    }
};
