// 回溯（枚舉下一個選哪個數）：buildCombinations 的下一個數只能從 start 開始選。
// 只往後選，同一組數字就只會以遞增順序出現一次，不會重複。
// 剪枝：還要選 need 個數時，起點最大只能到 n - need + 1，再往後剩下的數不夠湊滿 k 個。
// 組合總數是 C(n, k)，用 C(n, i + 1) = C(n, i) * (n - i) / (i + 1) 逐步算出。
// 時間 O(k·C(n, k))，空間 O(k)（不計答案）。
int combinationCount(int n, int k) {
    long long count = 1;
    for (int i = 0; i < k; i++) {
        count = count * (n - i) / (i + 1);
    }
    return (int)count;
}

void buildCombinations(int n, int k, int start, int* path, int pathSize, int** result, int* columnSizes, int* returnSize) {
    int need = k - pathSize;
    if (need == 0) {
        result[*returnSize] = malloc(sizeof(int) * k);
        for (int i = 0; i < k; i++) {
            result[*returnSize][i] = path[i];
        }
        columnSizes[*returnSize] = k;
        (*returnSize)++;
        return;
    }

    for (int number = start; number <= n - need + 1; number++) {
        path[pathSize] = number;
        buildCombinations(n, k, number + 1, path, pathSize + 1, result, columnSizes, returnSize);
    }
}

int** combine(int n, int k, int* returnSize, int** returnColumnSizes) {
    int total = combinationCount(n, k);
    int** result = malloc(sizeof(int*) * total);
    *returnColumnSizes = malloc(sizeof(int) * total);
    int* path = malloc(sizeof(int) * k);
    *returnSize = 0;
    buildCombinations(n, k, 1, path, 0, result, *returnColumnSizes, returnSize);
    free(path);
    return result;
}
