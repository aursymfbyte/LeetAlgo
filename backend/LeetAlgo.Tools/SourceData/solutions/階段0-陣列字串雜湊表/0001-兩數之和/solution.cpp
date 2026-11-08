// 用雜湊表記錄看過的數字和它的下標，每走到一個數，就查 target - num 有沒有出現過。
// 先查再存，才不會把同一個元素用兩次。
// 時間 O(n)，空間 O(n)。
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> indexOf;
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            int need = target - nums[i];
            if (indexOf.count(need) > 0) {
                return {indexOf[need], i};
            }
            indexOf[nums[i]] = i;
        }
        return {};
    }
};
