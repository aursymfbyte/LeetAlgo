// 遇到左括號就放進堆疊；遇到右括號時，堆疊頂端必須是同種類的左括號，配對成功就把它彈出。
// 最後堆疊必須是空的，代表每個左括號都有被關上。
// 時間 O(n)，空間 O(n)。
class Solution {
public:
    bool isValid(string s) {
        unordered_map<char, char> openingOf = {
            {')', '('},
            {']', '['},
            {'}', '{'}
        };
        stack<char> st;
        for (char ch : s) {
            if (openingOf.count(ch) > 0) {
                if (st.empty() || st.top() != openingOf[ch]) {
                    return false;
                }
                st.pop();
            } else {
                st.push(ch);
            }
        }
        return st.empty();
    }
};
