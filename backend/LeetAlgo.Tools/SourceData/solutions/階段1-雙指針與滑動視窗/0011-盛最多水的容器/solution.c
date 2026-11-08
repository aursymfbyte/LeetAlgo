// 左右指針從兩端開始，面積 = 寬度 × 兩條線中較短的那條。
// 每次移動較短的那條：如果移動較長的，寬度變小，高度仍被短板限制住，面積不可能變大，
// 所以短板跟中間任何一條線都圍不出更大的面積，可以直接排除。
// 時間 O(n)，空間 O(1)。
int maxArea(int* height, int heightSize) {
    int left = 0;
    int right = heightSize - 1;
    int answer = 0;
    while (left < right) {
        int shorter = height[left] < height[right] ? height[left] : height[right];
        int area = (right - left) * shorter;
        if (area > answer) {
            answer = area;
        }
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }
    return answer;
}
