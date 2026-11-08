// 每個字母從第一次出現到最後一次出現，可以看成一個區間；同一個字母只能在一段裡，所以有重疊的區間必須合併在同一段。
// 先記錄每個字母最後出現的位置 last。
// 從左往右走，end 是目前這一段至少要延伸到的位置，每走到一個字母就用它的 last 更新 end。
// 走到 i == end 時，這一段裡所有字母都不會再出現，可以在這裡切開，記下長度並從 i + 1 開始新的一段。
// 每一段至少有一種別段沒有的字母，所以最多 26 段。
// 時間 O(n)，空間 O(1)。
int* partitionLabels(char* s, int* returnSize) {
    int length = strlen(s);
    int last[26];
    for (int i = 0; i < length; i++) {
        last[s[i] - 'a'] = i;
    }

    int* answer = malloc(sizeof(int) * 26);
    *returnSize = 0;
    int start = 0;
    int end = 0;
    for (int i = 0; i < length; i++) {
        if (last[s[i] - 'a'] > end) {
            end = last[s[i] - 'a'];
        }
        if (i == end) {
            answer[*returnSize] = end - start + 1;
            (*returnSize)++;
            start = i + 1;
        }
    }
    return answer;
}
