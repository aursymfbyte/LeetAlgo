// 回溯（枚舉下一個選哪個數）：buildCombinations 的下一個數從 start 開始選，還要湊出 remaining。
// 只往後選，每個數最多用一次，也不會出現重複的組合。
// 剪枝一（個數）：還要選 need 個數時，起點最大只能到 9 - need + 1，否則剩下的數不夠。
// 剪枝二（總和）：數字是由小到大枚舉，一旦 number > remaining，後面更大的數也不可能，直接停止。
// 答案最多 C(9, k) 個。
// 時間 O(k·C(9, k))，空間 O(k)（不計答案）。
int combinationCount(int n, int k) {
    int count = 1;
    for (int i = 0; i < k; i++) {
        count = count * (n - i) / (i + 1);
    }
    return count;
}

void buildCombinations(int k, int start, int remaining, int* path, int pathSize, int** result, int* columnSizes, int* returnSize) {
    int need = k - pathSize;
    if (need == 0) {
        if (remaining == 0) {
            result[*returnSize] = malloc(sizeof(int) * k);
            for (int i = 0; i < k; i++) {
                result[*returnSize][i] = path[i];
            }
            columnSizes[*returnSize] = k;
            (*returnSize)++;
        }
        return;
    }

    for (int number = start; number <= 9 - need + 1; number++) {
        if (number > remaining) {
            break;
        }
        path[pathSize] = number;
        buildCombinations(k, number + 1, remaining - number, path, pathSize + 1, result, columnSizes, returnSize);
    }
}

int** combinationSum3(int k, int n, int* returnSize, int** returnColumnSizes) {
    int maxCount = combinationCount(9, k);
    int** result = malloc(sizeof(int*) * maxCount);
    *returnColumnSizes = malloc(sizeof(int) * maxCount);
    int* path = malloc(sizeof(int) * k);
    *returnSize = 0;
    buildCombinations(k, 1, n, path, 0, result, *returnColumnSizes, returnSize);
    free(path);
    return result;
}
