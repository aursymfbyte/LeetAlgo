// 用雜湊表把 key 對應到鏈結串列的節點，讓 get / put 能 O(1) 找到資料；
// 再用帶頭尾哨兵的雙向鏈結串列依照使用時間排列：頭哨兵後面是最近用過的，尾哨兵前面是最久沒用的。
// 每次 get 或 put 用到某個 key，就把它的節點移到最前面；容量超過時，刪掉尾哨兵前面那個節點。
// 節點裡要存 key，淘汰時才知道要從雜湊表刪掉哪個 key。
// get / put 都是 O(1)，空間 O(capacity)。
public class CacheNode {
    public int key;
    public int value;
    public CacheNode prev;
    public CacheNode next;

    public CacheNode(int key, int value) {
        this.key = key;
        this.value = value;
    }
}

public class LRUCache {
    private int capacity;
    private Dictionary<int, CacheNode> nodes;
    private CacheNode head;
    private CacheNode tail;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        nodes = new Dictionary<int, CacheNode>();
        head = new CacheNode(0, 0);
        tail = new CacheNode(0, 0);
        head.next = tail;
        tail.prev = head;
    }

    private void RemoveNode(CacheNode node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void AddToFront(CacheNode node) {
        node.prev = head;
        node.next = head.next;
        head.next.prev = node;
        head.next = node;
    }

    public int Get(int key) {
        if (!nodes.ContainsKey(key)) {
            return -1;
        }
        CacheNode node = nodes[key];
        RemoveNode(node);
        AddToFront(node);
        return node.value;
    }

    public void Put(int key, int value) {
        if (nodes.ContainsKey(key)) {
            CacheNode existing = nodes[key];
            existing.value = value;
            RemoveNode(existing);
            AddToFront(existing);
            return;
        }

        CacheNode node = new CacheNode(key, value);
        nodes[key] = node;
        AddToFront(node);
        if (nodes.Count > capacity) {
            CacheNode leastRecent = tail.prev;
            RemoveNode(leastRecent);
            nodes.Remove(leastRecent.key);
        }
    }
}
