// answer[i] = 左邊所有數的乘積 × 右邊所有數的乘積。
// 第一趟從左往右，把左邊乘積寫進 answer；第二趟從右往左，用一個變數累乘右邊乘積再乘上去。
// 時間 O(n)，空間 O(1)（不算答案陣列）。
public class Solution {
    public int[] ProductExceptSelf(int[] nums) {
        int n = nums.Length;
        int[] answer = new int[n];

        int leftProduct = 1;
        for (int i = 0; i < n; i++) {
            answer[i] = leftProduct;
            leftProduct *= nums[i];
        }

        int rightProduct = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i] *= rightProduct;
            rightProduct *= nums[i];
        }

        return answer;
    }
}
