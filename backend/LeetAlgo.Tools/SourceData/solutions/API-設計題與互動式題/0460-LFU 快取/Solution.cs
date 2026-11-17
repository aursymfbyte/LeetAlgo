// 每個使用次數 freq 各有一條雙向鏈結串列（帶哨兵節點的環狀串列），串列前端是最近用過的，尾端是最久沒用的。
// 另外用雜湊表從 key 找到節點、從 freq 找到它的串列，並記錄目前最小的使用次數 minFreq。
// 一個 key 被 get 或 put 時，把節點從舊次數的串列拿掉、次數加一、放到新次數串列的最前面；
// 如果舊串列因此變空而且它正是 minFreq，minFreq 就跟著加一。
// 容量滿了要淘汰時，取 minFreq 串列的尾端節點，就是使用次數最少、且其中最久沒用的 key。
// 新 key 的使用次數是 1，所以插入後 minFreq 一定變成 1。
// Get 和 Put 都是 O(1)，空間 O(capacity)。
public class LFUCache {
    private class Node {
        public int Key;
        public int Value;
        public int Freq;
        public Node Prev;
        public Node Next;

        public Node(int key, int value) {
            Key = key;
            Value = value;
            Freq = 1;
        }
    }

    private int capacity;
    private int minFreq;
    private Dictionary<int, Node> keyToNode;
    private Dictionary<int, Node> freqToHead;

    public LFUCache(int capacity) {
        this.capacity = capacity;
        minFreq = 0;
        keyToNode = new Dictionary<int, Node>();
        freqToHead = new Dictionary<int, Node>();
    }

    private void PushFront(Node node) {
        if (!freqToHead.ContainsKey(node.Freq)) {
            Node sentinel = new Node(0, 0);
            sentinel.Prev = sentinel;
            sentinel.Next = sentinel;
            freqToHead[node.Freq] = sentinel;
        }
        Node head = freqToHead[node.Freq];
        node.Prev = head;
        node.Next = head.Next;
        head.Next.Prev = node;
        head.Next = node;
    }

    private void RemoveNode(Node node) {
        node.Prev.Next = node.Next;
        node.Next.Prev = node.Prev;
        Node head = freqToHead[node.Freq];
        if (head.Next == head) {
            freqToHead.Remove(node.Freq);
            if (minFreq == node.Freq) {
                minFreq++;
            }
        }
    }

    private void IncreaseFreq(Node node) {
        RemoveNode(node);
        node.Freq++;
        PushFront(node);
    }

    public int Get(int key) {
        if (!keyToNode.ContainsKey(key)) {
            return -1;
        }
        Node node = keyToNode[key];
        IncreaseFreq(node);
        return node.Value;
    }

    public void Put(int key, int value) {
        if (keyToNode.ContainsKey(key)) {
            Node existing = keyToNode[key];
            existing.Value = value;
            IncreaseFreq(existing);
            return;
        }

        if (keyToNode.Count == capacity) {
            Node victim = freqToHead[minFreq].Prev;
            RemoveNode(victim);
            keyToNode.Remove(victim.Key);
        }

        Node node = new Node(key, value);
        keyToNode[key] = node;
        PushFront(node);
        minFreq = 1;
    }
}
