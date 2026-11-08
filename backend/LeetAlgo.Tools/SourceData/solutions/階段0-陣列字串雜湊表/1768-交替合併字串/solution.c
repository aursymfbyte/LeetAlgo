// 用同一個下標 i 同時走兩個字串，每輪各取一個字元；較短的字串用完後，只取另一個。
// 時間 O(m + n)，空間 O(m + n)。
char* mergeAlternately(char* word1, char* word2) {
    int length1 = strlen(word1);
    int length2 = strlen(word2);
    char* result = malloc(length1 + length2 + 1);

    int position = 0;
    int i = 0;
    while (i < length1 || i < length2) {
        if (i < length1) {
            result[position] = word1[i];
            position++;
        }
        if (i < length2) {
            result[position] = word2[i];
            position++;
        }
        i++;
    }
    result[position] = '\0';
    return result;
}
