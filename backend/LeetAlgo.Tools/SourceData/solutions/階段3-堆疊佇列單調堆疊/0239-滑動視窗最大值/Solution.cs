// 單調佇列：雙端佇列裡放下標，對應的值由前到後嚴格遞減，最前面就是目前視窗的最大值。
// 新元素 nums[i] 進來時，從尾端彈出所有 <= 它的元素，因為它們比 nums[i] 早離開又不比它大，不可能再當最大值。
// 前端的下標如果已經滑出視窗（<= i - k），就從前端彈出。
// 視窗湊滿 k 個之後，每一步的答案就是前端對應的值。
// 佇列用陣列加 head、tail 兩個位置表示，有效範圍是 [head, tail)。
// 每個下標最多進出佇列一次，時間 O(n)，空間 O(n)。
public class Solution {
    public int[] MaxSlidingWindow(int[] nums, int k) {
        int n = nums.Length;
        int[] window = new int[n];
        int head = 0;
        int tail = 0;
        int[] answer = new int[n - k + 1];

        for (int i = 0; i < n; i++) {
            while (tail > head && nums[window[tail - 1]] <= nums[i]) {
                tail--;
            }
            window[tail] = i;
            tail++;

            if (window[head] <= i - k) {
                head++;
            }

            if (i >= k - 1) {
                answer[i - k + 1] = nums[window[head]];
            }
        }
        return answer;
    }
}
