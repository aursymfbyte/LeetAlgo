// 先用單調堆疊算出 nums2 每個數的下一個更大元素：堆疊裡放還沒找到答案的數，由底到頂遞減，
// 新來的數比頂端大，頂端的答案就是它，彈出並記下來；沒被彈出的數答案就是 -1。
// 因為所有數字都不重複，而且範圍只有 0 到 10^4，直接用數值當陣列下標來記錄，nums1 的每個查詢就是查表。
// 時間 O(m + n)，空間 O(n + 10^4)，n 是 nums2 的長度，m 是 nums1 的長度。
#define MAX_VALUE 10000

int* nextGreaterElement(int* nums1, int nums1Size, int* nums2, int nums2Size, int* returnSize) {
    int* nextGreaterOf = malloc(sizeof(int) * (MAX_VALUE + 1));
    for (int value = 0; value <= MAX_VALUE; value++) {
        nextGreaterOf[value] = -1;
    }

    int* stack = malloc(sizeof(int) * nums2Size);
    int top = 0;
    for (int i = 0; i < nums2Size; i++) {
        while (top > 0 && nums2[i] > stack[top - 1]) {
            nextGreaterOf[stack[top - 1]] = nums2[i];
            top--;
        }
        stack[top] = nums2[i];
        top++;
    }

    int* answer = malloc(sizeof(int) * nums1Size);
    for (int i = 0; i < nums1Size; i++) {
        answer[i] = nextGreaterOf[nums1[i]];
    }

    free(nextGreaterOf);
    free(stack);
    *returnSize = nums1Size;
    return answer;
}
