// 分離鏈結法：桶陣列從 8 個桶開始，(key, value) 放進第 key % 桶數 個桶，同一個桶裡的資料存成一個串列。
// put 先在桶裡找 key，找到就改 value，找不到才新增；remove 在桶裡找到就拿掉。
// 存放的 key 數超過桶數時，桶數加倍並把所有資料重新分配，所以平均每個桶最多 1 筆資料。
// 加倍時搬動 n 筆資料的成本，分攤到之前的 n 次新增，每次只多 O(1)。
// 每次操作期望均攤 O(1)，空間 O(n)，n 是同時存放過最多的 key 數。
public class MyHashMap {
    private class Entry {
        public int Key;
        public int Value;

        public Entry(int key, int value) {
            Key = key;
            Value = value;
        }
    }

    private List<Entry>[] buckets;
    private int size;

    public MyHashMap() {
        buckets = CreateBuckets(8);
        size = 0;
    }

    private static List<Entry>[] CreateBuckets(int bucketCount) {
        List<Entry>[] newBuckets = new List<Entry>[bucketCount];
        for (int i = 0; i < bucketCount; i++) {
            newBuckets[i] = new List<Entry>();
        }
        return newBuckets;
    }

    private List<Entry> GetBucket(int key) {
        return buckets[key % buckets.Length];
    }

    private void Rehash() {
        List<Entry>[] oldBuckets = buckets;
        buckets = CreateBuckets(oldBuckets.Length * 2);
        foreach (List<Entry> bucket in oldBuckets) {
            foreach (Entry entry in bucket) {
                GetBucket(entry.Key).Add(entry);
            }
        }
    }

    public void Put(int key, int value) {
        List<Entry> bucket = GetBucket(key);
        foreach (Entry entry in bucket) {
            if (entry.Key == key) {
                entry.Value = value;
                return;
            }
        }
        bucket.Add(new Entry(key, value));
        size++;
        if (size > buckets.Length) {
            Rehash();
        }
    }

    public int Get(int key) {
        foreach (Entry entry in GetBucket(key)) {
            if (entry.Key == key) {
                return entry.Value;
            }
        }
        return -1;
    }

    public void Remove(int key) {
        List<Entry> bucket = GetBucket(key);
        for (int i = 0; i < bucket.Count; i++) {
            if (bucket[i].Key == key) {
                bucket.RemoveAt(i);
                size--;
                return;
            }
        }
    }
}
