// 回溯（枚舉這一段切到哪裡）：buildPartitions 處理 s[start..] 還沒切的部分。
// 枚舉這一段的結尾 end，只有 s[start..end] 是回文才記下這一段的起點與終點，再從 end + 1 繼續切。
// start 走到字串尾端時，記下的 pieceCount 段就是一種切法。
// 長度 n 的字串有 n - 1 個切點，切法最多 2^(n-1) 種。
// 時間 O(n·2^n)，空間 O(n)（不計答案）。
bool isPalindrome(char* s, int left, int right) {
    while (left < right) {
        if (s[left] != s[right]) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}

void buildPartitions(char* s, int length, int start, int* pieceStarts, int* pieceEnds, int pieceCount, char*** result, int* columnSizes, int* returnSize) {
    if (start == length) {
        char** pieces = malloc(sizeof(char*) * pieceCount);
        for (int i = 0; i < pieceCount; i++) {
            int pieceLength = pieceEnds[i] - pieceStarts[i] + 1;
            pieces[i] = malloc(sizeof(char) * (pieceLength + 1));
            memcpy(pieces[i], s + pieceStarts[i], pieceLength);
            pieces[i][pieceLength] = '\0';
        }
        result[*returnSize] = pieces;
        columnSizes[*returnSize] = pieceCount;
        (*returnSize)++;
        return;
    }

    for (int end = start; end < length; end++) {
        if (isPalindrome(s, start, end)) {
            pieceStarts[pieceCount] = start;
            pieceEnds[pieceCount] = end;
            buildPartitions(s, length, end + 1, pieceStarts, pieceEnds, pieceCount + 1, result, columnSizes, returnSize);
        }
    }
}

char*** partition(char* s, int* returnSize, int** returnColumnSizes) {
    int length = strlen(s);
    int maxCount = 1 << (length - 1);
    char*** result = malloc(sizeof(char**) * maxCount);
    *returnColumnSizes = malloc(sizeof(int) * maxCount);
    int* pieceStarts = malloc(sizeof(int) * length);
    int* pieceEnds = malloc(sizeof(int) * length);
    *returnSize = 0;
    buildPartitions(s, length, 0, pieceStarts, pieceEnds, 0, result, *returnColumnSizes, returnSize);
    free(pieceStarts);
    free(pieceEnds);
    return result;
}
