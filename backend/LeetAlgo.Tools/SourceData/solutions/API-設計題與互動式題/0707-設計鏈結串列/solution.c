// 用雙向鏈結串列，頭尾各放一個哨兵節點，真正的節點都夾在兩個哨兵之間，
// 這樣插入、刪除時每個節點一定有前後鄰居，不用特別處理頭尾。
// 找第 index 個節點時，看它離頭近還是離尾近，從近的那一端走過去。
// 第 size 個「節點」剛好是尾哨兵，所以 addAtIndex(size, val) 就是插在尾哨兵前面。
// 每個操作 O(min(index, size - index))，空間 O(n)。
struct LinkedNode {
    int val;
    struct LinkedNode* prev;
    struct LinkedNode* next;
};

typedef struct {
    struct LinkedNode* head;
    struct LinkedNode* tail;
    int size;
} MyLinkedList;

struct LinkedNode* createNode(int val) {
    struct LinkedNode* node = malloc(sizeof(struct LinkedNode));
    node->val = val;
    node->prev = NULL;
    node->next = NULL;
    return node;
}

MyLinkedList* myLinkedListCreate() {
    MyLinkedList* obj = malloc(sizeof(MyLinkedList));
    obj->head = createNode(0);
    obj->tail = createNode(0);
    obj->head->next = obj->tail;
    obj->tail->prev = obj->head;
    obj->size = 0;
    return obj;
}

struct LinkedNode* nodeAt(MyLinkedList* obj, int index) {
    struct LinkedNode* node;
    if (index < obj->size / 2) {
        node = obj->head->next;
        for (int i = 0; i < index; i++) {
            node = node->next;
        }
    } else {
        node = obj->tail;
        for (int i = 0; i < obj->size - index; i++) {
            node = node->prev;
        }
    }
    return node;
}

int myLinkedListGet(MyLinkedList* obj, int index) {
    if (index >= obj->size) {
        return -1;
    }
    return nodeAt(obj, index)->val;
}

void myLinkedListAddAtIndex(MyLinkedList* obj, int index, int val) {
    if (index > obj->size) {
        return;
    }
    struct LinkedNode* nextNode = nodeAt(obj, index);
    struct LinkedNode* prevNode = nextNode->prev;
    struct LinkedNode* newNode = createNode(val);
    newNode->prev = prevNode;
    newNode->next = nextNode;
    prevNode->next = newNode;
    nextNode->prev = newNode;
    obj->size++;
}

void myLinkedListAddAtHead(MyLinkedList* obj, int val) {
    myLinkedListAddAtIndex(obj, 0, val);
}

void myLinkedListAddAtTail(MyLinkedList* obj, int val) {
    myLinkedListAddAtIndex(obj, obj->size, val);
}

void myLinkedListDeleteAtIndex(MyLinkedList* obj, int index) {
    if (index >= obj->size) {
        return;
    }
    struct LinkedNode* node = nodeAt(obj, index);
    node->prev->next = node->next;
    node->next->prev = node->prev;
    free(node);
    obj->size--;
}

void myLinkedListFree(MyLinkedList* obj) {
    struct LinkedNode* node = obj->head;
    while (node != NULL) {
        struct LinkedNode* next = node->next;
        free(node);
        node = next;
    }
    free(obj);
}
