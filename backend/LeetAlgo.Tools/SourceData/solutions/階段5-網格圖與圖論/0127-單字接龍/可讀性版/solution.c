// 把每個單字當成節點，只差一個字母的兩個單字之間有邊，題目就變成在這張隱含圖上求最短路，用 BFS。
// 不先把圖建出來，而是走到一個單字時，把它每個位置換成 a 到 z，看換完的字在不在字典裡，在的話就是鄰居。
// 先把字典排序，之後用二分搜尋找出換完的字在字典裡的下標，再用 visited 標記走過。
// 時間 O(N * L^2 * 26 * log N)，空間 O(N * L)，N 是字典大小、L 是單字長度。
int compareWords(const void* a, const void* b) {
    const char* x = *(const char* const*)a;
    const char* y = *(const char* const*)b;
    return strcmp(x, y);
}

int findWord(char** words, int wordsSize, const char* target) {
    int left = 0;
    int right = wordsSize - 1;
    while (left <= right) {
        int middle = left + (right - left) / 2;
        int order = strcmp(words[middle], target);
        if (order == 0) {
            return middle;
        }
        if (order < 0) {
            left = middle + 1;
        } else {
            right = middle - 1;
        }
    }
    return -1;
}

int ladderLength(char* beginWord, char* endWord, char** wordList, int wordListSize) {
    char** words = malloc(sizeof(char*) * wordListSize);
    memcpy(words, wordList, sizeof(char*) * wordListSize);
    qsort(words, wordListSize, sizeof(char*), compareWords);

    int endIndex = findWord(words, wordListSize, endWord);
    if (endIndex == -1) {
        free(words);
        return 0;
    }

    bool* visited = calloc(wordListSize, sizeof(bool));
    int beginIndex = findWord(words, wordListSize, beginWord);
    if (beginIndex != -1) {
        visited[beginIndex] = true;
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
                    int index = findWord(words, wordListSize, candidate);
                    if (index == -1 || visited[index]) {
                        continue;
                    }
                    if (index == endIndex) {
                        free(words);
                        free(visited);
                        free(candidate);
                        free(queue);
                        return wordCount;
                    }
                    visited[index] = true;
                    queue[tail] = words[index];
                    tail++;
                }
                candidate[position] = original;
            }
        }
    }

    free(words);
    free(visited);
    free(candidate);
    free(queue);
    return 0;
}
