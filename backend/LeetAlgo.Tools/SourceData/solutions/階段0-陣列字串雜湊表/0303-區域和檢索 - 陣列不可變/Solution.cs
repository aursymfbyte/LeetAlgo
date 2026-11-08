// 建立前綴和 prefix[i] = nums[0] 到 nums[i - 1] 的總和，
// 區間 [left, right] 的和就是 prefix[right + 1] - prefix[left]。
// 建構 O(n)，每次查詢 O(1)，空間 O(n)。
public class NumArray {
    private int[] prefix;

    public NumArray(int[] nums) {
        prefix = new int[nums.Length + 1];
        for (int i = 0; i < nums.Length; i++) {
            prefix[i + 1] = prefix[i] + nums[i];
        }
    }

    public int SumRange(int left, int right) {
        return prefix[right + 1] - prefix[left];
    }
}
