// 遇到左括號就放進堆疊；遇到右括號時，堆疊頂端必須是同種類的左括號，配對成功就把它彈出。
// 最後堆疊必須是空的，代表每個左括號都有被關上。
// 時間 O(n)，空間 O(n)。
char openingOf(char close) {
    if (close == ')') {
        return '(';
    }
    if (close == ']') {
        return '[';
    }
    return '{';
}

bool isClosing(char ch) {
    return ch == ')' || ch == ']' || ch == '}';
}

bool isValid(char* s) {
    int length = strlen(s);
    char* stack = malloc(sizeof(char) * length);
    int top = 0;
    bool valid = true;

    for (int i = 0; i < length; i++) {
        char ch = s[i];
        if (isClosing(ch)) {
            if (top == 0 || stack[top - 1] != openingOf(ch)) {
                valid = false;
                break;
            }
            top--;
        } else {
            stack[top] = ch;
            top++;
        }
    }

    if (top != 0) {
        valid = false;
    }
    free(stack);
    return valid;
}
