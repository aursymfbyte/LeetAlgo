// 由左往右掃，current 是目前這一層正在組的字串，count 是正在讀的重複次數（可能有好幾位數）。
// 遇到 '[' 代表進入新的一層：把「外層已組好的字串」和「這層要重複幾次」存進堆疊，再清空重新開始。
// 遇到 ']' 代表這一層結束：從堆疊取回外層字串和次數，外層字串 + current 重複 k 次，就是新的 current。
// 每一層組出來的字串都會原樣出現在最終答案裡，所以長度不會超過答案上限 10^5。
// 時間 O(答案長度)，空間 O(答案長度 × 巢狀層數)。
#define MAX_RESULT_LENGTH 100000

char* decodeString(char* s) {
    int length = strlen(s);
    char** savedStrings = malloc(sizeof(char*) * length);
    int* savedLengths = malloc(sizeof(int) * length);
    int* savedCounts = malloc(sizeof(int) * length);
    int top = 0;

    char* current = malloc(sizeof(char) * (MAX_RESULT_LENGTH + 1));
    int currentLength = 0;
    int count = 0;

    for (int i = 0; i < length; i++) {
        char ch = s[i];
        if (ch >= '0' && ch <= '9') {
            count = count * 10 + (ch - '0');
        } else if (ch == '[') {
            savedStrings[top] = current;
            savedLengths[top] = currentLength;
            savedCounts[top] = count;
            top++;
            current = malloc(sizeof(char) * (MAX_RESULT_LENGTH + 1));
            currentLength = 0;
            count = 0;
        } else if (ch == ']') {
            top--;
            char* previous = savedStrings[top];
            int previousLength = savedLengths[top];
            for (int r = 0; r < savedCounts[top]; r++) {
                memcpy(previous + previousLength, current, currentLength);
                previousLength += currentLength;
            }
            free(current);
            current = previous;
            currentLength = previousLength;
        } else {
            current[currentLength] = ch;
            currentLength++;
        }
    }

    current[currentLength] = '\0';
    free(savedStrings);
    free(savedLengths);
    free(savedCounts);
    return current;
}
