// 用字典樹存所有加入的單字，每個節點有 26 個子節點和 isEnd 標記。
// 搜尋時用回溯：dfs(node, word, index) 表示從 node 開始，能不能配對 word 從 index 開始的部分。
// 遇到一般字母只走對應的子節點；遇到 '.' 就把每個存在的子節點都試一次，任何一條成功就是 true。
// 走完整個 word 時，要停在 isEnd 的節點才算有這個單字。
// addWord O(L)；search 最壞 O(26^d × L)，d 是 '.' 的個數（最多 2）；空間 O(所有單字總長度 × 26)。
struct TrieNode {
    TrieNode* children[26] = {};
    bool isEnd = false;
};

class WordDictionary {
private:
    TrieNode* root;

    bool dfs(TrieNode* node, const string& word, int index) {
        int wordLength = word.size();
        if (index == wordLength) {
            return node->isEnd;
        }
        char ch = word[index];
        if (ch == '.') {
            for (TrieNode* child : node->children) {
                if (child != nullptr && dfs(child, word, index + 1)) {
                    return true;
                }
            }
            return false;
        }
        TrieNode* next = node->children[ch - 'a'];
        return next != nullptr && dfs(next, word, index + 1);
    }

public:
    WordDictionary() {
        root = new TrieNode();
    }

    void addWord(string word) {
        TrieNode* node = root;
        for (char ch : word) {
            int index = ch - 'a';
            if (node->children[index] == nullptr) {
                node->children[index] = new TrieNode();
            }
            node = node->children[index];
        }
        node->isEnd = true;
    }

    bool search(string word) {
        return dfs(root, word, 0);
    }
};
