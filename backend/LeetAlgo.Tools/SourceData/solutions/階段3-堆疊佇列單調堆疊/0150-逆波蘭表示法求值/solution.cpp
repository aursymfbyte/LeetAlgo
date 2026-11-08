// 由左往右掃，遇到數字就放進堆疊；遇到運算子，就彈出兩個數字計算，再把結果放回堆疊。
// 先彈出的是右運算元、後彈出的是左運算元，減法和除法的順序不能弄反。
// 時間 O(n)，空間 O(n)。
class Solution {
public:
    int evalRPN(vector<string>& tokens) {
        stack<int> st;
        for (const string& token : tokens) {
            if (token == "+" || token == "-" || token == "*" || token == "/") {
                int right = st.top();
                st.pop();
                int left = st.top();
                st.pop();
                if (token == "+") {
                    st.push(left + right);
                } else if (token == "-") {
                    st.push(left - right);
                } else if (token == "*") {
                    st.push(left * right);
                } else {
                    st.push(left / right);
                }
            } else {
                st.push(stoi(token));
            }
        }
        return st.top();
    }
};
