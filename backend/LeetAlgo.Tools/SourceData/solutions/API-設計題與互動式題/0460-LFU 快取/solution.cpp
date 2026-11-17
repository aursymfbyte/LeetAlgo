// 每個使用次數 freq 各有一條雙向鏈結串列（帶哨兵節點的環狀串列），串列前端是最近用過的，尾端是最久沒用的。
// 另外用雜湊表從 key 找到節點、從 freq 找到它的串列，並記錄目前最小的使用次數 minFreq。
// 一個 key 被 get 或 put 時，把節點從舊次數的串列拿掉、次數加一、放到新次數串列的最前面；
// 如果舊串列因此變空而且它正是 minFreq，minFreq 就跟著加一。
// 容量滿了要淘汰時，取 minFreq 串列的尾端節點，就是使用次數最少、且其中最久沒用的 key。
// 新 key 的使用次數是 1，所以插入後 minFreq 一定變成 1。
// get 和 put 都是 O(1)，空間 O(capacity)。
class LFUCache {
private:
    struct Node {
        int key;
        int value;
        int freq;
        Node* prev;
        Node* next;
        Node(int key, int value) : key(key), value(value), freq(1), prev(nullptr), next(nullptr) {}
    };

    int capacity;
    int minFreq;
    unordered_map<int, Node*> keyToNode;
    unordered_map<int, Node*> freqToHead;

    void pushFront(Node* node) {
        if (freqToHead.count(node->freq) == 0) {
            Node* sentinel = new Node(0, 0);
            sentinel->prev = sentinel;
            sentinel->next = sentinel;
            freqToHead[node->freq] = sentinel;
        }
        Node* head = freqToHead[node->freq];
        node->prev = head;
        node->next = head->next;
        head->next->prev = node;
        head->next = node;
    }

    void removeNode(Node* node) {
        node->prev->next = node->next;
        node->next->prev = node->prev;
        Node* head = freqToHead[node->freq];
        if (head->next == head) {
            freqToHead.erase(node->freq);
            delete head;
            if (minFreq == node->freq) {
                minFreq++;
            }
        }
    }

    void increaseFreq(Node* node) {
        removeNode(node);
        node->freq++;
        pushFront(node);
    }

public:
    LFUCache(int capacity) {
        this->capacity = capacity;
        minFreq = 0;
    }

    ~LFUCache() {
        for (auto& [key, node] : keyToNode) {
            delete node;
        }
        for (auto& [freq, head] : freqToHead) {
            delete head;
        }
    }

    int get(int key) {
        if (keyToNode.count(key) == 0) {
            return -1;
        }
        Node* node = keyToNode[key];
        increaseFreq(node);
        return node->value;
    }

    void put(int key, int value) {
        if (keyToNode.count(key) > 0) {
            Node* existing = keyToNode[key];
            existing->value = value;
            increaseFreq(existing);
            return;
        }

        int size = keyToNode.size();
        if (size == capacity) {
            Node* victim = freqToHead[minFreq]->prev;
            removeNode(victim);
            keyToNode.erase(victim->key);
            delete victim;
        }

        Node* node = new Node(key, value);
        keyToNode[key] = node;
        pushFront(node);
        minFreq = 1;
    }
};
