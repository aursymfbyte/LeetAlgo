// 建立前綴和 prefix[i] = nums[0] 到 nums[i - 1] 的總和，
// 區間 [left, right] 的和就是 prefix[right + 1] - prefix[left]。
// 建構 O(n)，每次查詢 O(1)，空間 O(n)。
class NumArray {
private:
    vector<int> prefix;

public:
    NumArray(vector<int>& nums) {
        int n = nums.size();
        prefix.assign(n + 1, 0);
        for (int i = 0; i < n; i++) {
            prefix[i + 1] = prefix[i] + nums[i];
        }
    }

    int sumRange(int left, int right) {
        return prefix[right + 1] - prefix[left];
    }
};
