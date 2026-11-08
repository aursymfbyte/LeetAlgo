// 用雙向鏈結串列，頭尾各放一個哨兵節點，真正的節點都夾在兩個哨兵之間，
// 這樣插入、刪除時每個節點一定有前後鄰居，不用特別處理頭尾。
// 找第 index 個節點時，看它離頭近還是離尾近，從近的那一端走過去。
// 第 size 個「節點」剛好是尾哨兵，所以 addAtIndex(size, val) 就是插在尾哨兵前面。
// 每個操作 O(min(index, size - index))，空間 O(n)。
public class LinkedNode {
    public int val;
    public LinkedNode prev;
    public LinkedNode next;

    public LinkedNode(int val) {
        this.val = val;
    }
}

public class MyLinkedList {
    private LinkedNode head;
    private LinkedNode tail;
    private int size;

    public MyLinkedList() {
        head = new LinkedNode(0);
        tail = new LinkedNode(0);
        head.next = tail;
        tail.prev = head;
        size = 0;
    }

    private LinkedNode NodeAt(int index) {
        LinkedNode node;
        if (index < size / 2) {
            node = head.next;
            for (int i = 0; i < index; i++) {
                node = node.next;
            }
        } else {
            node = tail;
            for (int i = 0; i < size - index; i++) {
                node = node.prev;
            }
        }
        return node;
    }

    public int Get(int index) {
        if (index >= size) {
            return -1;
        }
        return NodeAt(index).val;
    }

    public void AddAtHead(int val) {
        AddAtIndex(0, val);
    }

    public void AddAtTail(int val) {
        AddAtIndex(size, val);
    }

    public void AddAtIndex(int index, int val) {
        if (index > size) {
            return;
        }
        LinkedNode nextNode = NodeAt(index);
        LinkedNode prevNode = nextNode.prev;
        LinkedNode newNode = new LinkedNode(val);
        newNode.prev = prevNode;
        newNode.next = nextNode;
        prevNode.next = newNode;
        nextNode.prev = newNode;
        size++;
    }

    public void DeleteAtIndex(int index) {
        if (index >= size) {
            return;
        }
        LinkedNode node = NodeAt(index);
        node.prev.next = node.next;
        node.next.prev = node.prev;
        size--;
    }
}
