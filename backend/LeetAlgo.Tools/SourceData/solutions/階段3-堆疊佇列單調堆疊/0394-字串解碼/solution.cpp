// 由左往右掃，current 是目前這一層正在組的字串，count 是正在讀的重複次數（可能有好幾位數）。
// 遇到 '[' 代表進入新的一層：把「外層已組好的字串」和「這層要重複幾次」存進堆疊，再清空重新開始。
// 遇到 ']' 代表這一層結束：從堆疊取回外層字串和次數，外層字串 + current 重複 k 次，就是新的 current。
// 時間 O(答案長度)，空間 O(答案長度)。
class Solution {
public:
    string decodeString(string s) {
        stack<string> savedStrings;
        stack<int> savedCounts;
        string current;
        int count = 0;

        for (char ch : s) {
            if (isdigit(ch)) {
                count = count * 10 + (ch - '0');
            } else if (ch == '[') {
                savedStrings.push(current);
                savedCounts.push(count);
                current = "";
                count = 0;
            } else if (ch == ']') {
                string previous = savedStrings.top();
                savedStrings.pop();
                int repeat = savedCounts.top();
                savedCounts.pop();
                for (int i = 0; i < repeat; i++) {
                    previous += current;
                }
                current = previous;
            } else {
                current += ch;
            }
        }
        return current;
    }
};
