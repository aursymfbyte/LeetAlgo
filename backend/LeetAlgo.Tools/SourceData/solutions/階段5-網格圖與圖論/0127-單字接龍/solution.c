// 把每個單字當成節點，只差一個字母的兩個單字之間有邊，題目就變成在這張隱含圖上求最短路，用 BFS。
// 不先把圖建出來，而是走到一個單字時，把它每個位置換成 a 到 z，看換完的字在不在字典裡，在的話就是鄰居。
// 字典裡的字被走到就從集合移除，等於標記走過，之後不會再進佇列。
// 時間 O(N * L^2 * 26)，空間 O(N * L)，N 是字典大小、L 是單字長度。
struct WordEntry {
    char* word;
    UT_hash_handle hh;
};

void freeWordSet(struct WordEntry* wordSet) {
    struct WordEntry* current;
    struct WordEntry* next;
    HASH_ITER(hh, wordSet, current, next) {
        HASH_DEL(wordSet, current);
        free(current);
    }
}

int ladderLength(char* beginWord, char* endWord, char** wordList, int wordListSize) {
    struct WordEntry* unvisited = NULL;
    for (int i = 0; i < wordListSize; i++) {
        struct WordEntry* entry = malloc(sizeof(struct WordEntry));
        entry->word = wordList[i];
        HASH_ADD_KEYPTR(hh, unvisited, entry->word, strlen(entry->word), entry);
    }

    struct WordEntry* found = NULL;
    HASH_FIND_STR(unvisited, endWord, found);
    if (found == NULL) {
        freeWordSet(unvisited);
        return 0;
    }

    HASH_FIND_STR(unvisited, beginWord, found);
    if (found != NULL) {
        HASH_DEL(unvisited, found);
        free(found);
    }

    int length = strlen(beginWord);
    char* candidate = malloc(length + 1);
    char** queue = malloc(sizeof(char*) * (wordListSize + 1));
    int head = 0;
    int tail = 0;
    queue[tail] = beginWord;
    tail++;

    int wordCount = 1;
    while (head < tail) {
        wordCount++;
        int levelEnd = tail;
        while (head < levelEnd) {
            strcpy(candidate, queue[head]);
            head++;
            for (int position = 0; position < length; position++) {
                char original = candidate[position];
                for (char letter = 'a'; letter <= 'z'; letter++) {
                    candidate[position] = letter;
                    HASH_FIND_STR(unvisited, candidate, found);
                    if (found == NULL) {
                        continue;
                    }
                    if (strcmp(candidate, endWord) == 0) {
                        free(candidate);
                        free(queue);
                        freeWordSet(unvisited);
                        return wordCount;
                    }
                    queue[tail] = found->word;
                    tail++;
                    HASH_DEL(unvisited, found);
                    free(found);
                }
                candidate[position] = original;
            }
        }
    }

    free(candidate);
    free(queue);
    freeWordSet(unvisited);
    return 0;
}
