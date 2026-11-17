// 用堆疊模擬中序遍歷：先把根一路往左的節點都推進堆疊，堆疊頂端就是目前最小的節點。
// next 時彈出堆疊頂端，再把它右子樹一路往左的節點推進去。
// hasNext 就是堆疊是否非空。
// 每個節點只會進出堆疊一次，next 均攤 O(1)，hasNext O(1)，空間 O(h)，h 是樹高。
class BSTIterator {
private:
    stack<TreeNode*> nodes;

    void pushLeft(TreeNode* node) {
        while (node != nullptr) {
            nodes.push(node);
            node = node->left;
        }
    }

public:
    BSTIterator(TreeNode* root) {
        pushLeft(root);
    }

    int next() {
        TreeNode* node = nodes.top();
        nodes.pop();
        pushLeft(node->right);
        return node->val;
    }

    bool hasNext() {
        return !nodes.empty();
    }
};
