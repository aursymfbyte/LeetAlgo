// 序列化：前序遍歷，每個節點寫出它的值，遇到空節點寫 "#"，每個標記後面接一個逗號。
// 有了空節點標記，每個節點的左右子樹在哪裡結束都很明確，只靠前序就能唯一還原整棵樹。
// 反序列化：照同樣的前序順序依序讀取，讀到 "#" 回傳空節點，否則建立節點後先建左子樹、再建右子樹。
// 兩個方向都是 O(n) 時間，空間 O(n)。
int countNodes(struct TreeNode* root) {
    if (root == NULL) {
        return 0;
    }
    return 1 + countNodes(root->left) + countNodes(root->right);
}

void writePreorder(struct TreeNode* node, char* buffer, int* length) {
    if (node == NULL) {
        *length += sprintf(buffer + *length, "#,");
        return;
    }
    *length += sprintf(buffer + *length, "%d,", node->val);
    writePreorder(node->left, buffer, length);
    writePreorder(node->right, buffer, length);
}

char* serialize(struct TreeNode* root) {
    int nodeCount = countNodes(root);
    int maxLength = nodeCount * 6 + (nodeCount + 1) * 2;
    char* buffer = malloc(maxLength + 1);
    int length = 0;
    buffer[0] = '\0';
    writePreorder(root, buffer, &length);
    return buffer;
}

struct TreeNode* buildPreorder(char* data, int* position) {
    if (data[*position] == '#') {
        *position += 2;
        return NULL;
    }
    char* end;
    int value = strtol(data + *position, &end, 10);
    *position = end - data + 1;

    struct TreeNode* node = malloc(sizeof(struct TreeNode));
    node->val = value;
    node->left = buildPreorder(data, position);
    node->right = buildPreorder(data, position);
    return node;
}

struct TreeNode* deserialize(char* data) {
    int position = 0;
    return buildPreorder(data, &position);
}
