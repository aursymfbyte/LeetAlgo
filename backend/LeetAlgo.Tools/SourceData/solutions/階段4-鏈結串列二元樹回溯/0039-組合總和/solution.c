// 先排序，再回溯：buildCombinations 的下一個數從 candidates[start] 開始選，還要湊出 remaining。
// 選了 candidates[i] 之後，下一層仍從 i 開始（不是 i + 1），所以同一個數可以重複選。
// 只往後選不回頭，[2,2,3] 和 [2,3,2] 這種順序不同的重複組合就不會出現。
// 排序後一旦 candidates[i] > remaining，後面的數只會更大，直接停止。
// 題目保證答案少於 150 個；每個數至少是 2，所以一個組合最多 target / 2 個數。
// 時間取決於答案的數量與長度（指數級），空間 O(target)（遞迴深度最多 target / 2）。
int compareInts(const void* a, const void* b) {
    int first = *(const int*)a;
    int second = *(const int*)b;
    if (first < second) {
        return -1;
    }
    if (first > second) {
        return 1;
    }
    return 0;
}

void buildCombinations(int* candidates, int candidatesSize, int start, int remaining, int* path, int pathSize, int** result, int* columnSizes, int* returnSize) {
    if (remaining == 0) {
        result[*returnSize] = malloc(sizeof(int) * pathSize);
        for (int i = 0; i < pathSize; i++) {
            result[*returnSize][i] = path[i];
        }
        columnSizes[*returnSize] = pathSize;
        (*returnSize)++;
        return;
    }

    for (int i = start; i < candidatesSize; i++) {
        if (candidates[i] > remaining) {
            break;
        }
        path[pathSize] = candidates[i];
        buildCombinations(candidates, candidatesSize, i, remaining - candidates[i], path, pathSize + 1, result, columnSizes, returnSize);
    }
}

int** combinationSum(int* candidates, int candidatesSize, int target, int* returnSize, int** returnColumnSizes) {
    qsort(candidates, candidatesSize, sizeof(int), compareInts);
    int maxCount = 150;
    int** result = malloc(sizeof(int*) * maxCount);
    *returnColumnSizes = malloc(sizeof(int) * maxCount);
    int* path = malloc(sizeof(int) * (target / 2 + 1));
    *returnSize = 0;
    buildCombinations(candidates, candidatesSize, 0, target, path, 0, result, *returnColumnSizes, returnSize);
    free(path);
    return result;
}
