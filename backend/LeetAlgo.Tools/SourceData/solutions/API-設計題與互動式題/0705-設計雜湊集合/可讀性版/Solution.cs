// 分離鏈結法：開一個長度 1009（質數）的桶陣列，key 放進第 key % 1009 個桶，
// 同一個桶裡的 key 串成一條鏈結串列。
// 新增前先在桶裡找，找到就不重複加；刪除時找到節點後把它從串列中接掉。
// key 平均分散在各桶時，每次操作 O(n / 1009)，空間 O(n + 1009)，n 是集合大小。
public class MyHashSet {
    private class Node {
        public int Key;
        public Node Next;

        public Node(int key, Node next) {
            Key = key;
            Next = next;
        }
    }

    private const int BucketCount = 1009;
    private Node[] buckets;

    public MyHashSet() {
        buckets = new Node[BucketCount];
    }

    public void Add(int key) {
        if (Contains(key)) {
            return;
        }
        int index = key % BucketCount;
        buckets[index] = new Node(key, buckets[index]);
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

    public bool Contains(int key) {
        Node node = buckets[key % BucketCount];
        while (node != null) {
            if (node.Key == key) {
                return true;
            }
            node = node.Next;
        }
        return false;
    }
}
