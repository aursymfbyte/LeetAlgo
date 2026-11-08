// 前後綴分解：第 i 格能接的水 = min(左邊含自己的最高, 右邊含自己的最高) - height[i]。
// 改用相向雙指針，邊走邊維護 preMax（左指針以左最高）和 sufMax（右指針以右最高）：
// 若 preMax < sufMax，左指針那格真正的後綴最高一定 >= sufMax > preMax，水量就由 preMax 決定，
// 可以直接算出來再右移左指針；反之，右指針那格的水量由 sufMax 決定，算完左移右指針。
// 時間 O(n)，空間 O(1)。
int trap(int* height, int heightSize) {
    int left = 0;
    int right = heightSize - 1;
    int preMax = 0;
    int sufMax = 0;
    int answer = 0;
    while (left < right) {
        if (height[left] > preMax) {
            preMax = height[left];
        }
        if (height[right] > sufMax) {
            sufMax = height[right];
        }
        if (preMax < sufMax) {
            answer += preMax - height[left];
            left++;
        } else {
            answer += sufMax - height[right];
            right--;
        }
    }
    return answer;
}
