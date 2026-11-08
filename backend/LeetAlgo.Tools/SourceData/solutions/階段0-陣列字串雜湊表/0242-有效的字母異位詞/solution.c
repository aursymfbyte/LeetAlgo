// 用長度 26 的陣列計數：s 的字母加一、t 的字母減一，最後全部歸零才是異位詞。
// 時間 O(n)，空間 O(1)。
bool isAnagram(char* s, char* t) {
    int lengthS = strlen(s);
    int lengthT = strlen(t);
    if (lengthS != lengthT) {
        return false;
    }

    int count[26] = {0};
    for (int i = 0; i < lengthS; i++) {
        count[s[i] - 'a']++;
        count[t[i] - 'a']--;
    }

    for (int i = 0; i < 26; i++) {
        if (count[i] != 0) {
            return false;
        }
    }
    return true;
}
