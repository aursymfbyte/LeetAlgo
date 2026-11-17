// 猜了 guessWord 得到 matches 之後，秘密單字和 guessWord 的吻合位置數一定剛好是 matches，
// 所以只留下「和 guessWord 吻合數也等於 matches」的候選字，其他都不可能是答案。
// 每次要猜哪個字：把剩下的候選字依「和這個字的吻合數」分組，最大那組就是猜它之後最壞會剩下的數量，
// 從所有單字中挑最壞情況最小的那個來猜（極小化極大），讓每一次猜測都盡量縮小範圍。
// 先看候選字、再看其他單字，而且只有嚴格更好才換，所以一樣好時會選到還可能是答案的候選字。
// 每次挑字 O(n * m * 6)，m 是剩下的候選字數，最多猜 allowedGuesses 次；空間 O(n)。
int countMatches(char* first, char* second) {
    int matches = 0;
    for (int i = 0; i < 6; i++) {
        if (first[i] == second[i]) {
            matches++;
        }
    }
    return matches;
}

int worstCaseRemaining(char* word, char** candidates, int candidateCount) {
    int groupSizes[7] = {0};
    for (int i = 0; i < candidateCount; i++) {
        groupSizes[countMatches(word, candidates[i])]++;
    }
    int worstCase = 0;
    for (int matches = 0; matches <= 6; matches++) {
        if (groupSizes[matches] > worstCase) {
            worstCase = groupSizes[matches];
        }
    }
    return worstCase;
}

char* pickGuess(char** words, int wordsSize, char** candidates, int candidateCount) {
    char* bestWord = candidates[0];
    int bestWorstCase = candidateCount + 1;
    for (int i = 0; i < candidateCount; i++) {
        int worstCase = worstCaseRemaining(candidates[i], candidates, candidateCount);
        if (worstCase < bestWorstCase) {
            bestWorstCase = worstCase;
            bestWord = candidates[i];
        }
    }
    for (int i = 0; i < wordsSize; i++) {
        int worstCase = worstCaseRemaining(words[i], candidates, candidateCount);
        if (worstCase < bestWorstCase) {
            bestWorstCase = worstCase;
            bestWord = words[i];
        }
    }
    return bestWord;
}

void findSecretWord(char** words, int wordsSize, Master* master) {
    char** candidates = malloc(sizeof(char*) * wordsSize);
    int candidateCount = wordsSize;
    for (int i = 0; i < wordsSize; i++) {
        candidates[i] = words[i];
    }

    while (candidateCount > 0) {
        char* guessWord = pickGuess(words, wordsSize, candidates, candidateCount);
        int matches = guess(master, guessWord);
        if (matches == 6) {
            break;
        }
        int remainingCount = 0;
        for (int i = 0; i < candidateCount; i++) {
            if (countMatches(candidates[i], guessWord) == matches) {
                candidates[remainingCount] = candidates[i];
                remainingCount++;
            }
        }
        candidateCount = remainingCount;
    }
    free(candidates);
}
