// 對頂堆疊：以游標為界，left 存游標左邊的字元（堆疊頂端緊貼游標），
// right 存游標右邊的字元，而且是倒著存，堆疊頂端同樣緊貼游標。
// 打字就是推進 left；刪除就是從 left 彈出；游標左移一格就是把 left 頂端搬到 right，右移則相反。
// 回傳游標左邊最後 10 個字元，就是 left 的最後 10 個。
// 每次操作 O(k + 10)，空間 O(總輸入長度)。
#define MAX_LENGTH 800000

typedef struct {
    char* left;
    int leftSize;
    char* right;
    int rightSize;
} TextEditor;

TextEditor* textEditorCreate() {
    TextEditor* obj = malloc(sizeof(TextEditor));
    obj->left = malloc(MAX_LENGTH);
    obj->leftSize = 0;
    obj->right = malloc(MAX_LENGTH);
    obj->rightSize = 0;
    return obj;
}

void textEditorAddText(TextEditor* obj, char* text) {
    for (int i = 0; text[i] != '\0'; i++) {
        obj->left[obj->leftSize] = text[i];
        obj->leftSize++;
    }
}

int textEditorDeleteText(TextEditor* obj, int k) {
    int deleted = k;
    if (deleted > obj->leftSize) {
        deleted = obj->leftSize;
    }
    obj->leftSize -= deleted;
    return deleted;
}

char* textBeforeCursor(TextEditor* obj) {
    int count = 10;
    if (count > obj->leftSize) {
        count = obj->leftSize;
    }
    char* result = malloc(count + 1);
    memcpy(result, obj->left + obj->leftSize - count, count);
    result[count] = '\0';
    return result;
}

char* textEditorCursorLeft(TextEditor* obj, int k) {
    while (k > 0 && obj->leftSize > 0) {
        obj->leftSize--;
        obj->right[obj->rightSize] = obj->left[obj->leftSize];
        obj->rightSize++;
        k--;
    }
    return textBeforeCursor(obj);
}

char* textEditorCursorRight(TextEditor* obj, int k) {
    while (k > 0 && obj->rightSize > 0) {
        obj->rightSize--;
        obj->left[obj->leftSize] = obj->right[obj->rightSize];
        obj->leftSize++;
        k--;
    }
    return textBeforeCursor(obj);
}

void textEditorFree(TextEditor* obj) {
    free(obj->left);
    free(obj->right);
    free(obj);
}
