// 異位詞就是每個字母出現次數都一樣，所以用長度固定為 p 長度的滑動視窗，維護視窗內 26 個字母的計數。
// 每一步：進：s[right] 計數加一；更新：視窗長度到 p 的長度時，計數跟 p 的計數完全相同就記下左端點；出：s[left] 計數減一。
// 時間 O(26n)，空間 O(26)。
bool sameCount(int* a, int* b) {
    for (int i = 0; i < 26; i++) {
        if (a[i] != b[i]) {
            return false;
        }
    }
    return true;
}

int* findAnagrams(char* s, char* p, int* returnSize) {
    int targetCount[26] = {0};
    int windowSize = strlen(p);
    for (int i = 0; i < windowSize; i++) {
        targetCount[p[i] - 'a']++;
    }

    int length = strlen(s);
    int* answer = malloc(sizeof(int) * length);
    *returnSize = 0;
    int windowCount[26] = {0};
    for (int right = 0; right < length; right++) {
        windowCount[s[right] - 'a']++;
        int left = right - windowSize + 1;
        if (left < 0) {
            continue;
        }
        if (sameCount(windowCount, targetCount)) {
            answer[*returnSize] = left;
            (*returnSize)++;
        }
        windowCount[s[left] - 'a']--;
    }
    return answer;
}
