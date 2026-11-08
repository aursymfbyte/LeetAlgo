// 互為異位詞的字串，26 個字母各自出現的次數一定完全相同。
// 數出每個字串裡 26 個字母的出現次數，拿這組次數當雜湊表的鍵來分組，就不用排序字串。
// 先記下每個字串屬於第幾組、每組有幾個字串，再一次把字串放進各組。
// 時間 O(n·(k + 26))，空間 O(n·(k + 26))，n 是字串數量，k 是最長字串的長度。
struct GroupEntry {
    char counts[26];
    int groupIndex;
    UT_hash_handle hh;
};

char*** groupAnagrams(char** strs, int strsSize, int* returnSize, int** returnColumnSizes) {
    struct GroupEntry* table = NULL;
    int* groupOfWord = malloc(sizeof(int) * strsSize);
    *returnColumnSizes = malloc(sizeof(int) * strsSize);
    *returnSize = 0;

    for (int i = 0; i < strsSize; i++) {
        char counts[26] = {0};
        int length = strlen(strs[i]);
        for (int j = 0; j < length; j++) {
            counts[strs[i][j] - 'a']++;
        }

        struct GroupEntry* found = NULL;
        HASH_FIND(hh, table, counts, sizeof(counts), found);
        if (found == NULL) {
            found = malloc(sizeof(struct GroupEntry));
            memcpy(found->counts, counts, sizeof(counts));
            found->groupIndex = *returnSize;
            HASH_ADD(hh, table, counts, sizeof(found->counts), found);
            (*returnColumnSizes)[*returnSize] = 0;
            (*returnSize)++;
        }

        groupOfWord[i] = found->groupIndex;
        (*returnColumnSizes)[found->groupIndex]++;
    }

    char*** groups = malloc(sizeof(char**) * *returnSize);
    int* filled = calloc(*returnSize, sizeof(int));
    for (int group = 0; group < *returnSize; group++) {
        groups[group] = malloc(sizeof(char*) * (*returnColumnSizes)[group]);
    }

    for (int i = 0; i < strsSize; i++) {
        int group = groupOfWord[i];
        groups[group][filled[group]] = strs[i];
        filled[group]++;
    }

    struct GroupEntry* current;
    struct GroupEntry* next;
    HASH_ITER(hh, table, current, next) {
        HASH_DEL(table, current);
        free(current);
    }
    free(groupOfWord);
    free(filled);
    return groups;
}
