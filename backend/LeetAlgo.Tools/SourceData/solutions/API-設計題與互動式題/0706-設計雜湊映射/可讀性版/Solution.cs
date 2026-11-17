// 分離鏈結法：開一個長度 1009（質數）的桶陣列，(key, value) 放進第 key % 1009 個桶，
// 同一個桶裡的節點串成一條鏈結串列。
// put 先在桶裡找 key，找到就改 value，找不到才新增節點；remove 找到節點後把它從串列中接掉。
// key 平均分散在各桶時，每次操作 O(n / 1009)，空間 O(n + 1009)，n 是映射大小。
public class MyHashMap {
    private class Node {
        public int Key;
        public int Value;
        public Node Next;

        public Node(int key, int value, Node next) {
            Key = key;
            Value = value;
            Next = next;
        }
    }

    private const int BucketCount = 1009;
    private Node[] buckets;

    public MyHashMap() {
        buckets = new Node[BucketCount];
    }

    private Node FindNode(int key) {
        Node node = buckets[key % BucketCount];
        while (node != null) {
            if (node.Key == key) {
                return node;
            }
            node = node.Next;
        }
        return null;
    }

    public void Put(int key, int value) {
        Node node = FindNode(key);
        if (node != null) {
            node.Value = value;
            return;
        }
        int index = key % BucketCount;
        buckets[index] = new Node(key, value, buckets[index]);
    }

    public int Get(int key) {
        Node node = FindNode(key);
        if (node == null) {
            return -1;
        }
        return node.Value;
    }

    public void Remove(int key) {
        int index = key % BucketCount;
        Node previous = null;
        Node current = buckets[index];
        while (current != null) {
            if (current.Key == key) {
                if (previous == null) {
                    buckets[index] = current.Next;
                } else {
                    previous.Next = current.Next;
                }
                return;
            }
            previous = current;
            current = current.Next;
        }
    }
}
