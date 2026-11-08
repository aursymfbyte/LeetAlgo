// 枚舉每根柱子當矩形的高度，矩形能往左右延伸到「第一根比它矮的柱子」為止。
// 用單調堆疊各掃一次：left[i] 是左邊第一根比它矮的柱子下標（沒有就是 -1），
// right[i] 是右邊第一根比它矮的柱子下標（沒有就是 n），寬度就是 right[i] - left[i] - 1。
// 堆疊裡的高度由底到頂嚴格遞增，比目前柱子高或一樣高的都彈出，剩下的頂端就是第一根更矮的。
// 時間 O(n)，空間 O(n)。
public class Solution {
    public int LargestRectangleArea(int[] heights) {
        int n = heights.Length;

        int[] left = new int[n];
        Stack<int> stack = new Stack<int>();
        for (int i = 0; i < n; i++) {
            while (stack.Count > 0 && heights[stack.Peek()] >= heights[i]) {
                stack.Pop();
            }
            if (stack.Count > 0) {
                left[i] = stack.Peek();
            } else {
                left[i] = -1;
            }
            stack.Push(i);
        }

        int[] right = new int[n];
        stack.Clear();
        for (int i = n - 1; i >= 0; i--) {
            while (stack.Count > 0 && heights[stack.Peek()] >= heights[i]) {
                stack.Pop();
            }
            if (stack.Count > 0) {
                right[i] = stack.Peek();
            } else {
                right[i] = n;
            }
            stack.Push(i);
        }

        int answer = 0;
        for (int i = 0; i < n; i++) {
            int width = right[i] - left[i] - 1;
            answer = Math.Max(answer, heights[i] * width);
        }
        return answer;
    }
}
