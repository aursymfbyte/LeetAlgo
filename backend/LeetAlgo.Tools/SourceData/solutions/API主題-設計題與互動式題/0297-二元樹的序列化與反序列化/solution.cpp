// 序列化：前序遍歷，每個節點寫出它的值，遇到空節點寫 "#"，每個標記後面接一個逗號。
// 有了空節點標記，每個節點的左右子樹在哪裡結束都很明確，只靠前序就能唯一還原整棵樹。
// 反序列化：照同樣的前序順序依序讀取，讀到 "#" 回傳空節點，否則建立節點後先建左子樹、再建右子樹。
// 兩個方向都是 O(n) 時間，空間 O(n)。
class Codec {
private:
    void preorder(TreeNode* node, string& result) {
        if (node == nullptr) {
            result += "#,";
            return;
        }
        result += to_string(node->val);
        result += ",";
        preorder(node->left, result);
        preorder(node->right, result);
    }

    TreeNode* build(vector<string>& tokens, int& position) {
        int index = position;
        position++;
        if (tokens[index] == "#") {
            return nullptr;
        }
        TreeNode* node = new TreeNode(stoi(tokens[index]));
        node->left = build(tokens, position);
        node->right = build(tokens, position);
        return node;
    }

public:
    string serialize(TreeNode* root) {
        string result;
        preorder(root, result);
        return result;
    }

    TreeNode* deserialize(string data) {
        vector<string> tokens;
        stringstream stream(data);
        string token;
        while (getline(stream, token, ',')) {
            tokens.push_back(token);
        }
        int position = 0;
        return build(tokens, position);
    }
};
