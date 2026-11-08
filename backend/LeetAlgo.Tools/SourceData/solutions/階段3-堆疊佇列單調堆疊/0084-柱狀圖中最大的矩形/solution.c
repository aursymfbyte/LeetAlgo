// 枚舉每根柱子當矩形的高度，矩形能往左右延伸到「第一根比它矮的柱子」為止。
// 用單調堆疊各掃一次：left[i] 是左邊第一根比它矮的柱子下標（沒有就是 -1），
// right[i] 是右邊第一根比它矮的柱子下標（沒有就是 n），寬度就是 right[i] - left[i] - 1。
// 堆疊裡的高度由底到頂嚴格遞增，比目前柱子高或一樣高的都彈出，剩下的頂端就是第一根更矮的。
// 時間 O(n)，空間 O(n)。
int largestRectangleArea(int* heights, int heightsSize) {
    int n = heightsSize;
    int* left = malloc(sizeof(int) * n);
    int* right = malloc(sizeof(int) * n);
    int* stack = malloc(sizeof(int) * n);
    int top = 0;

    for (int i = 0; i < n; i++) {
        while (top > 0 && heights[stack[top - 1]] >= heights[i]) {
            top--;
        }
        if (top > 0) {
            left[i] = stack[top - 1];
        } else {
            left[i] = -1;
        }
        stack[top] = i;
        top++;
    }

    top = 0;
    for (int i = n - 1; i >= 0; i--) {
        while (top > 0 && heights[stack[top - 1]] >= heights[i]) {
            top--;
        }
        if (top > 0) {
            right[i] = stack[top - 1];
        } else {
            right[i] = n;
        }
        stack[top] = i;
        top++;
    }

    int answer = 0;
    for (int i = 0; i < n; i++) {
        int width = right[i] - left[i] - 1;
        int area = heights[i] * width;
        if (area > answer) {
            answer = area;
        }
    }

    free(left);
    free(right);
    free(stack);
    return answer;
}
