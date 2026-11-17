// 分離鏈結法：開一個長度 1009（質數）的桶陣列，(key, value) 放進第 key % 1009 個桶，
// 同一個桶裡的節點串成一條鏈結串列。
// put 先在桶裡找 key，找到就改 value，找不到才新增節點；remove 找到節點後把它從串列中接掉。
// key 平均分散在各桶時，每次操作 O(n / 1009)，空間 O(n + 1009)，n 是映射大小。
class MyHashMap {
private:
    struct Node {
        int key;
        int value;
        Node* next;
        Node(int key, int value, Node* next) : key(key), value(value), next(next) {}
    };

    static const int BUCKET_COUNT = 1009;
    vector<Node*> buckets;

    Node* findNode(int key) {
        Node* node = buckets[key % BUCKET_COUNT];
        while (node != nullptr) {
            if (node->key == key) {
                return node;
            }
            node = node->next;
        }
        return nullptr;
    }

public:
    MyHashMap() {
        buckets.assign(BUCKET_COUNT, nullptr);
    }

    ~MyHashMap() {
        for (Node* node : buckets) {
            while (node != nullptr) {
                Node* next = node->next;
                delete node;
                node = next;
            }
        }
    }

    void put(int key, int value) {
        Node* found = findNode(key);
        if (found != nullptr) {
            found->value = value;
            return;
        }
        int index = key % BUCKET_COUNT;
        buckets[index] = new Node(key, value, buckets[index]);
    }

    int get(int key) {
        Node* found = findNode(key);
        if (found == nullptr) {
            return -1;
        }
        return found->value;
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
};
