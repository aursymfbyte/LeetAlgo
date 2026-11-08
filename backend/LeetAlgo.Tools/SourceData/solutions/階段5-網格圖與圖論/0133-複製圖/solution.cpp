// 用雜湊表記錄「原節點 → 複本」。DFS 到一個節點時，如果已經有複本就直接回傳，
// 否則先建立複本並記進雜湊表，再遞迴複製每個鄰居。
// 一定要先記錄再處理鄰居，圖裡有環，否則會在環上無限遞迴。
// 時間 O(V + E)，空間 O(V)。
class Solution {
private:
    Node* clone(Node* original, unordered_map<Node*, Node*>& copies) {
        if (copies.count(original) > 0) {
            return copies[original];
        }

        Node* copy = new Node(original->val);
        copies[original] = copy;
        for (Node* neighbor : original->neighbors) {
            copy->neighbors.push_back(clone(neighbor, copies));
        }
        return copy;
    }

public:
    Node* cloneGraph(Node* node) {
        if (node == nullptr) {
            return nullptr;
        }
        unordered_map<Node*, Node*> copies;
        return clone(node, copies);
    }
};
