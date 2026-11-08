// 每個字母從第一次出現到最後一次出現，可以看成一個區間；同一個字母只能在一段裡，所以有重疊的區間必須合併在同一段。
// 先記錄每個字母最後出現的位置 last。
// 從左往右走，end 是目前這一段至少要延伸到的位置，每走到一個字母就用它的 last 更新 end。
// 走到 i == end 時，這一段裡所有字母都不會再出現，可以在這裡切開，記下長度並從 i + 1 開始新的一段。
// 時間 O(n)，空間 O(1)（字母只有 26 種）。
class Solution {
public:
    vector<int> partitionLabels(string s) {
        int n = s.size();
        vector<int> last(26);
        for (int i = 0; i < n; i++) {
            last[s[i] - 'a'] = i;
        }

        vector<int> answer;
        int start = 0;
        int end = 0;
        for (int i = 0; i < n; i++) {
            end = max(end, last[s[i] - 'a']);
            if (i == end) {
                answer.push_back(end - start + 1);
                start = i + 1;
            }
        }
        return answer;
    }
};
