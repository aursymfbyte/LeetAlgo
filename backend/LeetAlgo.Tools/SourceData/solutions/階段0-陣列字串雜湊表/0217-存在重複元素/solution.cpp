// 用集合記錄看過的數字，遇到已經在集合裡的數字就代表有重複。
// 時間 O(n)，空間 O(n)。
class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int num : nums) {
            if (seen.count(num) > 0) {
                return true;
            }
            seen.insert(num);
        }
        return false;
    }
};
