// 房子圍成一圈，第一間和最後一間不能同時偷，所以拆成兩種情況各做一次 198 題的線性打家劫舍：
// 不偷最後一間（只看 nums[0] 到 nums[n - 2]），或不偷第一間（只看 nums[1] 到 nums[n - 1]），兩者取大。
// 線性部分：f[i] 表示前 i 間房子最多能偷多少，f[i] = max(f[i - 1], f[i - 2] + 第 i 間的錢)。
// f[i] 只依賴前兩項，所以只用 f0、f1 兩個變數記住 f[i - 2]、f[i - 1]；直接在原陣列上用 first、last 指定範圍，不複製子陣列。
// 只有一間房子時沒有相鄰問題，直接偷。
// 時間 O(n)，空間 O(1)。
public class Solution {
    public int Rob(int[] nums) {
        int n = nums.Length;
        if (n == 1) {
            return nums[0];
        }
        return Math.Max(RobRange(nums, 0, n - 2), RobRange(nums, 1, n - 1));
    }

    private int RobRange(int[] nums, int first, int last) {
        int f0 = 0;
        int f1 = nums[first];
        for (int i = first + 1; i <= last; i++) {
            int newF = Math.Max(f1, f0 + nums[i]);
            f0 = f1;
            f1 = newF;
        }
        return f1;
    }
}
