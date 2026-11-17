// 分離鏈結法：桶陣列從 8 個桶開始，(key, value) 放進第 key % 桶數 個桶，同一個桶裡的資料存成一個串列。
// put 先在桶裡找 key，找到就改 value，找不到才新增；remove 在桶裡找到就拿掉。
// 存放的 key 數超過桶數時，桶數加倍並把所有資料重新分配，所以平均每個桶最多 1 筆資料。
// 加倍時搬動 n 筆資料的成本，分攤到之前的 n 次新增，每次只多 O(1)。
// 每次操作期望均攤 O(1)，空間 O(n)，n 是同時存放過最多的 key 數。
class MyHashMap {
private:
    vector<vector<pair<int, int>>> buckets;
    int size;

    vector<pair<int, int>>& getBucket(int key) {
        int bucketCount = buckets.size();
        return buckets[key % bucketCount];
    }

    void rehash() {
        vector<vector<pair<int, int>>> oldBuckets;
        oldBuckets.swap(buckets);
        buckets = vector<vector<pair<int, int>>>(oldBuckets.size() * 2);
        for (vector<pair<int, int>>& bucket : oldBuckets) {
            for (pair<int, int>& entry : bucket) {
                getBucket(entry.first).push_back(entry);
            }
        }
    }

public:
    MyHashMap() {
        buckets = vector<vector<pair<int, int>>>(8);
        size = 0;
    }

    void put(int key, int value) {
        vector<pair<int, int>>& bucket = getBucket(key);
        for (pair<int, int>& entry : bucket) {
            if (entry.first == key) {
                entry.second = value;
                return;
            }
        }
        bucket.push_back({key, value});
        size++;
        int bucketCount = buckets.size();
        if (size > bucketCount) {
            rehash();
        }
    }

    int get(int key) {
        vector<pair<int, int>>& bucket = getBucket(key);
        for (pair<int, int>& entry : bucket) {
            if (entry.first == key) {
                return entry.second;
            }
        }
        return -1;
    }

    void remove(int key) {
        vector<pair<int, int>>& bucket = getBucket(key);
        int bucketLength = bucket.size();
        for (int i = 0; i < bucketLength; i++) {
            if (bucket[i].first == key) {
                bucket.erase(bucket.begin() + i);
                size--;
                return;
            }
        }
    }
};
