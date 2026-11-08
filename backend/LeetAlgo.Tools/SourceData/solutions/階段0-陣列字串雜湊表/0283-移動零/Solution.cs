// 用 write 指向下一個要放非零數的位置，把非零數依序往前覆寫，最後把剩下的位置補 0。
// 時間 O(n)，空間 O(1)。
public class Solution {
    public void MoveZeroes(int[] nums) {
        int write = 0;
        foreach (int num in nums) {
            if (num != 0) {
                nums[write] = num;
                write++;
            }
        }

        for (int i = write; i < nums.Length; i++) {
            nums[i] = 0;
        }
    }
}
