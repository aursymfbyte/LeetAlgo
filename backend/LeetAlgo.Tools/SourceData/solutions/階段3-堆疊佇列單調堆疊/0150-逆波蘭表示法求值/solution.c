// 由左往右掃，遇到數字就放進堆疊；遇到運算子，就彈出兩個數字計算，再把結果放回堆疊。
// 先彈出的是右運算元、後彈出的是左運算元，減法和除法的順序不能弄反。
// 運算子都只有一個字元；負數如 "-11" 長度大於 1，所以會被當成數字。
// 時間 O(n)，空間 O(n)。
bool isOperator(char* token) {
    if (strlen(token) != 1) {
        return false;
    }
    char ch = token[0];
    return ch == '+' || ch == '-' || ch == '*' || ch == '/';
}

int evalRPN(char** tokens, int tokensSize) {
    int* stack = malloc(sizeof(int) * tokensSize);
    int top = 0;

    for (int i = 0; i < tokensSize; i++) {
        char* token = tokens[i];
        if (isOperator(token)) {
            int right = stack[top - 1];
            int left = stack[top - 2];
            top -= 2;

            int result;
            if (token[0] == '+') {
                result = left + right;
            } else if (token[0] == '-') {
                result = left - right;
            } else if (token[0] == '*') {
                result = left * right;
            } else {
                result = left / right;
            }
            stack[top] = result;
            top++;
        } else {
            stack[top] = atoi(token);
            top++;
        }
    }

    int answer = stack[top - 1];
    free(stack);
    return answer;
}
