// 回溯：一格一格填長度 2n 的字串，buildParentheses 記錄目前已經放了幾個左、右括號。
// 左括號還沒用完（openCount < n）就可以放左括號。
// 只有在右括號比左括號少（closeCount < openCount）時才能放右括號，這樣任何前綴的左括號數都 ≥ 右括號數，字串一定合法。
// 答案個數是第 n 個卡特蘭數 C_n，用 C_(i+1) = C_i * 2(2i + 1) / (i + 2) 逐步算出。
// 時間 O(n·C_n)，空間 O(n)（不計答案）。
int catalanNumber(int n) {
    int count = 1;
    for (int i = 0; i < n; i++) {
        count = count * 2 * (2 * i + 1) / (i + 2);
    }
    return count;
}

void buildParentheses(int n, int openCount, int closeCount, char* path, char** result, int* returnSize) {
    if (closeCount == n) {
        result[*returnSize] = malloc(sizeof(char) * (2 * n + 1));
        strcpy(result[*returnSize], path);
        (*returnSize)++;
        return;
    }

    int position = openCount + closeCount;
    if (openCount < n) {
        path[position] = '(';
        buildParentheses(n, openCount + 1, closeCount, path, result, returnSize);
    }
    if (closeCount < openCount) {
        path[position] = ')';
        buildParentheses(n, openCount, closeCount + 1, path, result, returnSize);
    }
}

char** generateParenthesis(int n, int* returnSize) {
    char** result = malloc(sizeof(char*) * catalanNumber(n));
    char* path = malloc(sizeof(char) * (2 * n + 1));
    path[2 * n] = '\0';
    *returnSize = 0;
    buildParentheses(n, 0, 0, path, result, returnSize);
    free(path);
    return result;
}
