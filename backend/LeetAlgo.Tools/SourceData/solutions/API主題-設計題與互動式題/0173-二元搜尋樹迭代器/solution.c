// 用堆疊模擬中序遍歷：先把根一路往左的節點都推進堆疊，堆疊頂端就是目前最小的節點。
// next 時彈出堆疊頂端，再把它右子樹一路往左的節點推進去。
// hasNext 就是堆疊是否非空。
// 每個節點只會進出堆疊一次，next 均攤 O(1)，hasNext O(1)，空間 O(h)，h 是樹高。
#define MAX_NODES 100000

typedef struct {
    struct TreeNode** stack;
    int top;
} BSTIterator;

void pushLeft(BSTIterator* obj, struct TreeNode* node) {
    while (node != NULL) {
        obj->stack[obj->top] = node;
        obj->top++;
        node = node->left;
    }
}

BSTIterator* bSTIteratorCreate(struct TreeNode* root) {
    BSTIterator* obj = malloc(sizeof(BSTIterator));
    obj->stack = malloc(sizeof(struct TreeNode*) * MAX_NODES);
    obj->top = 0;
    pushLeft(obj, root);
    return obj;
}

int bSTIteratorNext(BSTIterator* obj) {
    obj->top--;
    struct TreeNode* node = obj->stack[obj->top];
    pushLeft(obj, node->right);
    return node->val;
}

bool bSTIteratorHasNext(BSTIterator* obj) {
    return obj->top > 0;
}

void bSTIteratorFree(BSTIterator* obj) {
    free(obj->stack);
    free(obj);
}
