// 每個節點有 26 個子節點（對應 a 到 z）和一個 isEnd，標記是否有單字在這裡結束。
// insert 沿著字母往下走，沒有的子節點就建立，最後把結尾節點標成 isEnd。
// search 和 startsWith 都是沿著字母往下找節點：找不到就是 false；
// 找到了，startsWith 直接回傳 true，search 還要看結尾節點的 isEnd。
// 每個操作 O(L)，L 是字串長度；空間 O(所有插入字串的總長度 × 26)。
typedef struct Trie {
    struct Trie* children[26];
    bool isEnd;
} Trie;

Trie* trieCreate() {
    Trie* node = malloc(sizeof(Trie));
    for (int i = 0; i < 26; i++) {
        node->children[i] = NULL;
    }
    node->isEnd = false;
    return node;
}

void trieInsert(Trie* obj, char* word) {
    Trie* node = obj;
    for (int i = 0; word[i] != '\0'; i++) {
        int index = word[i] - 'a';
        if (node->children[index] == NULL) {
            node->children[index] = trieCreate();
        }
        node = node->children[index];
    }
    node->isEnd = true;
}

Trie* findNode(Trie* obj, char* text) {
    Trie* node = obj;
    for (int i = 0; text[i] != '\0'; i++) {
        int index = text[i] - 'a';
        if (node->children[index] == NULL) {
            return NULL;
        }
        node = node->children[index];
    }
    return node;
}

bool trieSearch(Trie* obj, char* word) {
    Trie* node = findNode(obj, word);
    return node != NULL && node->isEnd;
}

bool trieStartsWith(Trie* obj, char* prefix) {
    return findNode(obj, prefix) != NULL;
}

void trieFree(Trie* obj) {
    for (int i = 0; i < 26; i++) {
        if (obj->children[i] != NULL) {
            trieFree(obj->children[i]);
        }
    }
    free(obj);
}
