// 左右指針從兩端開始，面積 = 寬度 × 兩條線中較短的那條。
// 每次移動較短的那條：如果移動較長的，寬度變小，高度仍被短板限制住，面積不可能變大，
// 所以短板跟中間任何一條線都圍不出更大的面積，可以直接排除。
// 時間 O(n)，空間 O(1)。
public class Solution {
    public int MaxArea(int[] height) {
        int left = 0;
        int right = height.Length - 1;
        int answer = 0;
        while (left < right) {
            int area = (right - left) * Math.Min(height[left], height[right]);
            answer = Math.Max(answer, area);
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        return answer;
    }
}
