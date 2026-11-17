// 分離鏈結法：桶陣列從 8 個桶開始，key 放進第 key % 桶數 個桶，同一個桶裡的 key 存成一個串列。
// 新增前先在桶裡找，找到就不重複加；刪除時在桶裡找到就拿掉。
// 存放的 key 數超過桶數時，桶數加倍並把所有 key 重新分配，所以平均每個桶最多 1 個 key。
// 加倍時搬動 n 個 key 的成本，分攤到之前的 n 次新增，每次只多 O(1)。
// 每次操作期望均攤 O(1)，空間 O(n)，n 是同時存放過最多的 key 數。
class MyHashSet {
private:
    vector<vector<int>> buckets;
    int size;

    vector<int>& getBucket(int key) {
        int bucketCount = buckets.size();
        return buckets[key % bucketCount];
    }

    void rehash() {
        vector<vector<int>> oldBuckets;
        oldBuckets.swap(buckets);
        buckets = vector<vector<int>>(oldBuckets.size() * 2);
        for (vector<int>& bucket : oldBuckets) {
            for (int key : bucket) {
                getBucket(key).push_back(key);
            }
        }
    }

public:
    MyHashSet() {
        buckets = vector<vector<int>>(8);
        size = 0;
    }

    void add(int key) {
        if (contains(key)) {
            return;
        }
        getBucket(key).push_back(key);
        size++;
        int bucketCount = buckets.size();
        if (size > bucketCount) {
            rehash();
        }
    }

    void remove(int key) {
        vector<int>& bucket = getBucket(key);
        int bucketLength = bucket.size();
        for (int i = 0; i < bucketLength; i++) {
            if (bucket[i] == key) {
                bucket.erase(bucket.begin() + i);
                size--;
                return;
            }
        }
    }

    bool contains(int key) {
        vector<int>& bucket = getBucket(key);
        for (int storedKey : bucket) {
            if (storedKey == key) {
                return true;
            }
        }
        return false;
    }
};
