// 中心擴展：回文串以中心左右對稱，長度為奇數時中心是一個字元，偶數時中心在兩個字元之間，
// 所以長度 n 的字串共有 2n - 1 個中心。center 為偶數時從 (center / 2, center / 2) 開始，
// 奇數時從 (center / 2, center / 2 + 1) 開始，兩端字元相同就往外擴，記錄擴到最長的那一段。
// 時間 O(n^2)，空間 O(1)（不算回傳的字串）。
char* longestPalindrome(char* s) {
    int n = strlen(s);
    int bestStart = 0;
    int bestLength = 0;
    for (int center = 0; center < 2 * n - 1; center++) {
        int left = center / 2;
        int right = left + center % 2;
        while (left >= 0 && right < n && s[left] == s[right]) {
            left--;
            right++;
        }
        int length = right - left - 1;
        if (length > bestLength) {
            bestLength = length;
            bestStart = left + 1;
        }
    }

    char* result = malloc(sizeof(char) * (bestLength + 1));
    memcpy(result, s + bestStart, bestLength);
    result[bestLength] = '\0';
    return result;
}
