// 用雜湊表把 key 對應到鏈結串列的節點，讓 get / put 能 O(1) 找到資料；
// 再用帶頭尾哨兵的雙向鏈結串列依照使用時間排列：頭哨兵後面是最近用過的，尾哨兵前面是最久沒用的。
// 每次 get 或 put 用到某個 key，就把它的節點移到最前面；容量超過時，刪掉尾哨兵前面那個節點。
// 節點裡要存 key，淘汰時才知道要從雜湊表刪掉哪個 key。
// get / put 都是 O(1)，空間 O(capacity)。
struct CacheNode {
    int key;
    int value;
    CacheNode* prev;
    CacheNode* next;

    CacheNode(int key, int value) : key(key), value(value), prev(nullptr), next(nullptr) {}
};

class LRUCache {
private:
    int capacity;
    unordered_map<int, CacheNode*> nodes;
    CacheNode* head;
    CacheNode* tail;

    void removeNode(CacheNode* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }

    void addToFront(CacheNode* node) {
        node->prev = head;
        node->next = head->next;
        head->next->prev = node;
        head->next = node;
    }

public:
    LRUCache(int capacity) {
        this->capacity = capacity;
        head = new CacheNode(0, 0);
        tail = new CacheNode(0, 0);
        head->next = tail;
        tail->prev = head;
    }

    int get(int key) {
        if (nodes.count(key) == 0) {
            return -1;
        }
        CacheNode* node = nodes[key];
        removeNode(node);
        addToFront(node);
        return node->value;
    }

    void put(int key, int value) {
        if (nodes.count(key) > 0) {
            CacheNode* existing = nodes[key];
            existing->value = value;
            removeNode(existing);
            addToFront(existing);
            return;
        }

        CacheNode* node = new CacheNode(key, value);
        nodes[key] = node;
        addToFront(node);
        int cacheSize = nodes.size();
        if (cacheSize > capacity) {
            CacheNode* leastRecent = tail->prev;
            removeNode(leastRecent);
            nodes.erase(leastRecent->key);
            delete leastRecent;
        }
    }
};
