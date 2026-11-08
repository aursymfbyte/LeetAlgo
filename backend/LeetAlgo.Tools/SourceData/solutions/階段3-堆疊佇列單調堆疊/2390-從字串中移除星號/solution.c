// 把結果當成堆疊：遇到字母就放進去，遇到星號就彈出頂端，也就是左邊最近的那個字母，
// 效果就像打字時按退格鍵。最後堆疊裡剩下的字元就是答案。
// 時間 O(n)，空間 O(n)。
char* removeStars(char* s) {
    int length = strlen(s);
    char* result = malloc(sizeof(char) * (length + 1));
    int top = 0;

    for (int i = 0; i < length; i++) {
        if (s[i] == '*') {
            top--;
        } else {
            result[top] = s[i];
            top++;
        }
    }

    result[top] = '\0';
    return result;
}
