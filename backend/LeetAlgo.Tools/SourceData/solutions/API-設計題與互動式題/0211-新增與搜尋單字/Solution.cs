// 用字典樹存所有加入的單字，每個節點有 26 個子節點和 isEnd 標記。
// 搜尋時用回溯：Dfs(node, index) 表示從 node 開始，能不能配對 word[index..]。
// 遇到一般字母只走對應的子節點；遇到 '.' 就把每個存在的子節點都試一次，任何一條成功就是 true。
// 走完整個 word 時，要停在 isEnd 的節點才算有這個單字。
// addWord O(L)；search 最壞 O(26^d × L)，d 是 '.' 的個數（最多 2）；空間 O(所有單字總長度 × 26)。
public class TrieNode {
    public TrieNode[] children = new TrieNode[26];
    public bool isEnd = false;
}

public class WordDictionary {
    private TrieNode root;

    public WordDictionary() {
        root = new TrieNode();
    }

    public void AddWord(string word) {
        TrieNode node = root;
        foreach (char ch in word) {
            int index = ch - 'a';
            if (node.children[index] == null) {
                node.children[index] = new TrieNode();
            }
            node = node.children[index];
        }
        node.isEnd = true;
    }

    public bool Search(string word) {
        return Dfs(root, word, 0);
    }

    private bool Dfs(TrieNode node, string word, int index) {
        if (index == word.Length) {
            return node.isEnd;
        }
        char ch = word[index];
        if (ch == '.') {
            foreach (TrieNode child in node.children) {
                if (child != null && Dfs(child, word, index + 1)) {
                    return true;
                }
            }
            return false;
        }
        TrieNode next = node.children[ch - 'a'];
        return next != null && Dfs(next, word, index + 1);
    }
}
