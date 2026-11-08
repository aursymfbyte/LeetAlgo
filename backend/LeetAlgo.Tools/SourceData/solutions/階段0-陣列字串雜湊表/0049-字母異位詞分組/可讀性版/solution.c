// 互為異位詞的字串，把字母排序後會變成同一個字串，把它當成「鍵」。
// 再依鍵把所有字串排序，鍵相同的字串就會排在一起，一段一段切出來就是各組。
// 時間 O(n·k log k + k·n log n)，空間 O(n·k)，n 是字串數量，k 是最長字串的長度。
struct Item {
    char* key;
    int index;
};

int compareChars(const void* a, const void* b) {
    return *(const char*)a - *(const char*)b;
}

int compareItems(const void* a, const void* b) {
    const struct Item* x = a;
    const struct Item* y = b;
    return strcmp(x->key, y->key);
}

char*** groupAnagrams(char** strs, int strsSize, int* returnSize, int** returnColumnSizes) {
    struct Item* items = malloc(sizeof(struct Item) * strsSize);
    for (int i = 0; i < strsSize; i++) {
        int length = strlen(strs[i]);
        items[i].key = malloc(length + 1);
        strcpy(items[i].key, strs[i]);
        qsort(items[i].key, length, sizeof(char), compareChars);
        items[i].index = i;
    }
    qsort(items, strsSize, sizeof(struct Item), compareItems);

    char*** groups = malloc(sizeof(char**) * strsSize);
    *returnColumnSizes = malloc(sizeof(int) * strsSize);
    *returnSize = 0;

    int start = 0;
    while (start < strsSize) {
        int end = start;
        while (end < strsSize && strcmp(items[end].key, items[start].key) == 0) {
            end++;
        }

        int groupSize = end - start;
        char** group = malloc(sizeof(char*) * groupSize);
        for (int k = 0; k < groupSize; k++) {
            group[k] = strs[items[start + k].index];
        }

        groups[*returnSize] = group;
        (*returnColumnSizes)[*returnSize] = groupSize;
        (*returnSize)++;
        start = end;
    }

    for (int i = 0; i < strsSize; i++) {
        free(items[i].key);
    }
    free(items);
    return groups;
}
