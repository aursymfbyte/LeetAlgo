// 先把字典裡的單字全部放進字典樹（Trie）。
// f[i] 表示 s 的前 i 個字元能不能拆成字典裡的單字，f[0] = true（空字串）。
// 從左到右枚舉 i，只要 f[i] 為真，就從 s[i] 開始沿著字典樹往後走：
// 每走到一個單字結尾的節點（對應 s[i..j]），就代表前 j + 1 個字元也能拆，f[j + 1] = true；
// 字典樹走不下去就停，所以每個 i 最多只走 L 步。
// n 是 s 的長度、D 是單字數、L 是單字最大長度。
// 時間 O(n·L + D·L)，空間 O(n + D·L)。
struct TrieNode {
    TrieNode* children[26] = {};
    bool isEnd = false;

    ~TrieNode() {
        for (TrieNode* child : children) {
            delete child;
        }
    }
};

class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        TrieNode root;
        for (const string& word : wordDict) {
            TrieNode* node = &root;
            for (char c : word) {
                int index = c - 'a';
                if (node->children[index] == nullptr) {
                    node->children[index] = new TrieNode();
                }
                node = node->children[index];
            }
            node->isEnd = true;
        }

        int n = s.size();
        vector<bool> f(n + 1, false);
        f[0] = true;
        for (int i = 0; i < n; i++) {
            if (!f[i]) {
                continue;
            }
            TrieNode* node = &root;
            for (int j = i; j < n; j++) {
                node = node->children[s[j] - 'a'];
                if (node == nullptr) {
                    break;
                }
                if (node->isEnd) {
                    f[j + 1] = true;
                }
            }
        }
        return f[n];
    }
};
