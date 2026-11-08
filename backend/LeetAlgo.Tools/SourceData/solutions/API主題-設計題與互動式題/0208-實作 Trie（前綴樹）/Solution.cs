// 每個節點有 26 個子節點（對應 a 到 z）和一個 isEnd，標記是否有單字在這裡結束。
// insert 沿著字母往下走，沒有的子節點就建立，最後把結尾節點標成 isEnd。
// search 和 startsWith 都是沿著字母往下找節點：找不到就是 false；
// 找到了，startsWith 直接回傳 true，search 還要看結尾節點的 isEnd。
// 每個操作 O(L)，L 是字串長度；空間 O(所有插入字串的總長度 × 26)。
public class TrieNode {
    public TrieNode[] children = new TrieNode[26];
    public bool isEnd = false;
}

public class Trie {
    private TrieNode root;

    public Trie() {
        root = new TrieNode();
    }

    public void Insert(string word) {
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

    private TrieNode FindNode(string text) {
        TrieNode node = root;
        foreach (char ch in text) {
            int index = ch - 'a';
            if (node.children[index] == null) {
                return null;
            }
            node = node.children[index];
        }
        return node;
    }

    public bool Search(string word) {
        TrieNode node = FindNode(word);
        return node != null && node.isEnd;
    }

    public bool StartsWith(string prefix) {
        return FindNode(prefix) != null;
    }
}
