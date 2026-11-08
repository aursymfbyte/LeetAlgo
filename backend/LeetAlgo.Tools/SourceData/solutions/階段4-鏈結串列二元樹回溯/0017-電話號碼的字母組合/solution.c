// 回溯：path[i] 代表第 i 個數字選了哪個字母，buildCombinations 負責填第 index 格。
// 每一格都把該數字對應的字母試一遍，填滿 n 格就得到一個組合。
// 因為每次都是直接覆蓋 path[index]，不需要額外的「撤銷」動作。
// 時間 O(n·4^n)，空間 O(n)（不計答案）。
const char* PHONE_LETTERS[10] = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

void buildCombinations(char* digits, int length, int index, char* path, char** result, int* returnSize) {
    if (index == length) {
        result[*returnSize] = malloc(sizeof(char) * (length + 1));
        strcpy(result[*returnSize], path);
        (*returnSize)++;
        return;
    }

    const char* options = PHONE_LETTERS[digits[index] - '0'];
    int optionCount = strlen(options);
    for (int i = 0; i < optionCount; i++) {
        path[index] = options[i];
        buildCombinations(digits, length, index + 1, path, result, returnSize);
    }
}

char** letterCombinations(char* digits, int* returnSize) {
    int length = strlen(digits);
    int total = 1;
    for (int i = 0; i < length; i++) {
        total *= strlen(PHONE_LETTERS[digits[i] - '0']);
    }

    char** result = malloc(sizeof(char*) * total);
    char* path = malloc(sizeof(char) * (length + 1));
    path[length] = '\0';
    *returnSize = 0;
    buildCombinations(digits, length, 0, path, result, returnSize);
    free(path);
    return result;
}
