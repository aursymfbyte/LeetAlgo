// 用字典樹存所有加入的單字，每個節點有 26 個子節點和 isEnd 標記。
// 搜尋時用回溯：dfs(node, word, index) 表示從 node 開始，能不能配對 word 從 index 開始的部分。
// 遇到一般字母只走對應的子節點；遇到 '.' 就把每個存在的子節點都試一次，任何一條成功就是 true。
// 走完整個 word 時，要停在 isEnd 的節點才算有這個單字。
// addWord O(L)；search 最壞 O(26^d × L)，d 是 '.' 的個數（最多 2）；空間 O(所有單字總長度 × 26)。
typedef struct WordDictionary {
    struct WordDictionary* children[26];
    bool isEnd;
} WordDictionary;

WordDictionary* wordDictionaryCreate() {
    WordDictionary* node = malloc(sizeof(WordDictionary));
    for (int i = 0; i < 26; i++) {
        node->children[i] = NULL;
    }
    node->isEnd = false;
    return node;
}

void wordDictionaryAddWord(WordDictionary* obj, char* word) {
    WordDictionary* node = obj;
    for (int i = 0; word[i] != '\0'; i++) {
        int index = word[i] - 'a';
        if (node->children[index] == NULL) {
            node->children[index] = wordDictionaryCreate();
        }
        node = node->children[index];
    }
    node->isEnd = true;
}

bool dfs(WordDictionary* node, char* word, int index) {
    if (word[index] == '\0') {
        return node->isEnd;
    }
    char ch = word[index];
    if (ch == '.') {
        for (int i = 0; i < 26; i++) {
            if (node->children[i] != NULL && dfs(node->children[i], word, index + 1)) {
                return true;
            }
        }
        return false;
    }
    WordDictionary* next = node->children[ch - 'a'];
    return next != NULL && dfs(next, word, index + 1);
}

bool wordDictionarySearch(WordDictionary* obj, char* word) {
    return dfs(obj, word, 0);
}

void wordDictionaryFree(WordDictionary* obj) {
    for (int i = 0; i < 26; i++) {
        if (obj->children[i] != NULL) {
            wordDictionaryFree(obj->children[i]);
        }
    }
    free(obj);
}
