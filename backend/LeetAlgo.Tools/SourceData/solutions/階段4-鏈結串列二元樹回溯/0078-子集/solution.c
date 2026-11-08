// 回溯（選或不選）：buildSubsets 決定 nums[index] 要不要放進子集。
// 不選就直接看下一個數；選就把它寫進 path[pathSize]，並讓 pathSize 加一往下遞迴。
// 每個數都決定完（index == numsSize）時，path 的前 pathSize 個數就是一個子集。
// 子集總數是 2^n。
// 時間 O(n·2^n)，空間 O(n)（不計答案）。
void buildSubsets(int* nums, int numsSize, int index, int* path, int pathSize, int** result, int* columnSizes, int* returnSize) {
    if (index == numsSize) {
        result[*returnSize] = malloc(sizeof(int) * pathSize);
        for (int i = 0; i < pathSize; i++) {
            result[*returnSize][i] = path[i];
        }
        columnSizes[*returnSize] = pathSize;
        (*returnSize)++;
        return;
    }

    buildSubsets(nums, numsSize, index + 1, path, pathSize, result, columnSizes, returnSize);
    path[pathSize] = nums[index];
    buildSubsets(nums, numsSize, index + 1, path, pathSize + 1, result, columnSizes, returnSize);
}

int** subsets(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {
    int total = 1 << numsSize;
    int** result = malloc(sizeof(int*) * total);
    *returnColumnSizes = malloc(sizeof(int) * total);
    int* path = malloc(sizeof(int) * numsSize);
    *returnSize = 0;
    buildSubsets(nums, numsSize, 0, path, 0, result, *returnColumnSizes, returnSize);
    free(path);
    return result;
}
