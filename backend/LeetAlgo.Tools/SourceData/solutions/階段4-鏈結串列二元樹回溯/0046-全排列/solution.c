// 回溯（排列型）：buildPermutations 負責決定排列的第 position 個位置放哪個數。
// 用 used[i] 記錄 nums[i] 是否已經放進排列；每個位置都從還沒用過的數裡挑一個。
// 遞迴回來後把 used[i] 改回 false（恢復現場），讓這個數可以放在別的位置。
// 排列總數是 n!。
// 時間 O(n·n!)，空間 O(n)（不計答案）。
void buildPermutations(int* nums, int numsSize, int position, int* path, bool* used, int** result, int* columnSizes, int* returnSize) {
    if (position == numsSize) {
        result[*returnSize] = malloc(sizeof(int) * numsSize);
        for (int i = 0; i < numsSize; i++) {
            result[*returnSize][i] = path[i];
        }
        columnSizes[*returnSize] = numsSize;
        (*returnSize)++;
        return;
    }

    for (int i = 0; i < numsSize; i++) {
        if (!used[i]) {
            used[i] = true;
            path[position] = nums[i];
            buildPermutations(nums, numsSize, position + 1, path, used, result, columnSizes, returnSize);
            used[i] = false;
        }
    }
}

int** permute(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {
    int total = 1;
    for (int i = 2; i <= numsSize; i++) {
        total *= i;
    }

    int** result = malloc(sizeof(int*) * total);
    *returnColumnSizes = malloc(sizeof(int) * total);
    int* path = malloc(sizeof(int) * numsSize);
    bool* used = calloc(numsSize, sizeof(bool));
    *returnSize = 0;
    buildPermutations(nums, numsSize, 0, path, used, result, *returnColumnSizes, returnSize);
    free(path);
    free(used);
    return result;
}
