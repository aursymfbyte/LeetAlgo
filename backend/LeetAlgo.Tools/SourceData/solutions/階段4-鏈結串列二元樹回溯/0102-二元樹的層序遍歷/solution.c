// 用佇列做 BFS。每一輪開始時佇列裡剛好是同一層的所有節點，先記下佇列的大小就是這一層的節點數。
// 把這一層的節點依序取出、記錄它們的值，同時把它們的左右孩子放進佇列，佇列裡留下的就是下一層。
// 時間 O(n)，空間 O(n)。
#define MAX_NODES 2000

int** levelOrder(struct TreeNode* root, int* returnSize, int** returnColumnSizes) {
    int** result = malloc(sizeof(int*) * MAX_NODES);
    *returnColumnSizes = malloc(sizeof(int) * MAX_NODES);
    *returnSize = 0;
    if (root == NULL) {
        return result;
    }

    struct TreeNode** queue = malloc(sizeof(struct TreeNode*) * MAX_NODES);
    int head = 0;
    int tail = 0;
    queue[tail] = root;
    tail++;

    while (head < tail) {
        int levelSize = tail - head;
        int* levelValues = malloc(sizeof(int) * levelSize);
        for (int i = 0; i < levelSize; i++) {
            struct TreeNode* node = queue[head];
            head++;
            levelValues[i] = node->val;
            if (node->left != NULL) {
                queue[tail] = node->left;
                tail++;
            }
            if (node->right != NULL) {
                queue[tail] = node->right;
                tail++;
            }
        }
        result[*returnSize] = levelValues;
        (*returnColumnSizes)[*returnSize] = levelSize;
        (*returnSize)++;
    }

    free(queue);
    return result;
}
