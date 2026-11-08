// 用 write 指向下一個要放非零數的位置，把非零數依序往前覆寫，最後把剩下的位置補 0。
// 時間 O(n)，空間 O(1)。
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int n = nums.size();
        int write = 0;
        for (int i = 0; i < n; i++) {
            if (nums[i] != 0) {
                nums[write] = nums[i];
                write++;
            }
        }

        for (int i = write; i < n; i++) {
            nums[i] = 0;
        }
    }
};
