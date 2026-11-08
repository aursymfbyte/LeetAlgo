// 分離鏈結法：桶陣列從 8 個桶開始，key 放進第 key % 桶數 個桶，同一個桶裡的 key 存成一個串列。
// 新增前先在桶裡找，找到就不重複加；刪除時在桶裡找到就拿掉。
// 存放的 key 數超過桶數時，桶數加倍並把所有 key 重新分配，所以平均每個桶最多 1 個 key。
// 加倍時搬動 n 個 key 的成本，分攤到之前的 n 次新增，每次只多 O(1)。
// 每次操作期望均攤 O(1)，空間 O(n)，n 是同時存放過最多的 key 數。
public class MyHashSet {
    private List<int>[] buckets;
    private int size;

    public MyHashSet() {
        buckets = CreateBuckets(8);
        size = 0;
    }

    private static List<int>[] CreateBuckets(int bucketCount) {
        List<int>[] newBuckets = new List<int>[bucketCount];
        for (int i = 0; i < bucketCount; i++) {
            newBuckets[i] = new List<int>();
        }
        return newBuckets;
    }

    private List<int> GetBucket(int key) {
        return buckets[key % buckets.Length];
    }

    private void Rehash() {
        List<int>[] oldBuckets = buckets;
        buckets = CreateBuckets(oldBuckets.Length * 2);
        foreach (List<int> bucket in oldBuckets) {
            foreach (int key in bucket) {
                GetBucket(key).Add(key);
            }
        }
    }

    public void Add(int key) {
        List<int> bucket = GetBucket(key);
        if (bucket.Contains(key)) {
            return;
        }
        bucket.Add(key);
        size++;
        if (size > buckets.Length) {
            Rehash();
        }
    }

    public void Remove(int key) {
        if (GetBucket(key).Remove(key)) {
            size--;
        }
    }

    public bool Contains(int key) {
        return GetBucket(key).Contains(key);
    }
}
