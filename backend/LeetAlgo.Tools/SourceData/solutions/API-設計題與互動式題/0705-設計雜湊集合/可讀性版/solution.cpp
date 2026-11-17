// 分離鏈結法：開一個長度 1009（質數）的桶陣列，key 放進第 key % 1009 個桶，
// 同一個桶裡的 key 串成一條鏈結串列。
// 新增前先在桶裡找，找到就不重複加；刪除時找到節點後把它從串列中接掉。
// key 平均分散在各桶時，每次操作 O(n / 1009)，空間 O(n + 1009)，n 是集合大小。
class MyHashSet {
private:
    struct Node {
        int key;
        Node* next;
        Node(int key, Node* next) : key(key), next(next) {}
    };

    static const int BUCKET_COUNT = 1009;
    vector<Node*> buckets;

public:
    MyHashSet() {
        buckets.assign(BUCKET_COUNT, nullptr);
    }

    ~MyHashSet() {
        for (Node* node : buckets) {
            while (node != nullptr) {
                Node* next = node->next;
                delete node;
                node = next;
            }
        }
    }

    void add(int key) {
        if (contains(key)) {
            return;
        }
        int index = key % BUCKET_COUNT;
        buckets[index] = new Node(key, buckets[index]);
    }

    void remove(int key) {
        int index = key % BUCKET_COUNT;
        Node* previous = nullptr;
        Node* current = buckets[index];
        while (current != nullptr) {
            if (current->key == key) {
                if (previous == nullptr) {
                    buckets[index] = current->next;
                } else {
                    previous->next = current->next;
                }
                delete current;
                return;
            }
            previous = current;
            current = current->next;
        }
    }

    bool contains(int key) {
        Node* node = buckets[key % BUCKET_COUNT];
        while (node != nullptr) {
            if (node->key == key) {
                return true;
            }
            node = node->next;
        }
        return false;
    }
};
