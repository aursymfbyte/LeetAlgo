// 先排序，枚舉第一個數 nums[i]，剩下兩個數在 i 右邊用相向雙指針找（跟 167 題一樣）。
// 去重：nums[i] 跟前一個數相同就跳過；找到一組答案後，左右指針也要跳過相同的數。
// 剪枝一：nums[i] 加上它後面最小的兩個數已經 > 0，之後的 i 只會更大，直接結束。
// 剪枝二：nums[i] 加上最大的兩個數仍然 < 0，這個 i 不可能湊出 0，換下一個 i。
// 時間 O(n^2)，空間 O(1)（不計排序和輸出）。
int compareInt(const void* a, const void* b) {
    int x = *(const int*)a;
    int y = *(const int*)b;
    if (x < y) {
        return -1;
    }
    if (x > y) {
        return 1;
    }
    return 0;
}

int** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {
    qsort(nums, numsSize, sizeof(int), compareInt);
    int capacity = 16;
    int** answer = malloc(sizeof(int*) * capacity);
    *returnSize = 0;

    for (int i = 0; i < numsSize - 2; i++) {
        int first = nums[i];
        if (i > 0 && first == nums[i - 1]) {
            continue;
        }
        if (first + nums[i + 1] + nums[i + 2] > 0) {
            break;
        }
        if (first + nums[numsSize - 2] + nums[numsSize - 1] < 0) {
            continue;
        }

        int left = i + 1;
        int right = numsSize - 1;
        while (left < right) {
            int total = first + nums[left] + nums[right];
            if (total > 0) {
                right--;
            } else if (total < 0) {
                left++;
            } else {
                if (*returnSize == capacity) {
                    capacity *= 2;
                    answer = realloc(answer, sizeof(int*) * capacity);
                }
                int* triplet = malloc(sizeof(int) * 3);
                triplet[0] = first;
                triplet[1] = nums[left];
                triplet[2] = nums[right];
                answer[*returnSize] = triplet;
                (*returnSize)++;

                left++;
                while (left < right && nums[left] == nums[left - 1]) {
                    left++;
                }
                right--;
                while (left < right && nums[right] == nums[right + 1]) {
                    right--;
                }
            }
        }
    }

    *returnColumnSizes = malloc(sizeof(int) * (*returnSize));
    for (int i = 0; i < *returnSize; i++) {
        (*returnColumnSizes)[i] = 3;
    }
    return answer;
}
