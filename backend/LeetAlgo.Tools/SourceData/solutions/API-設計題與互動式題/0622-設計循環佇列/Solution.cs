// 用長度 k 的陣列當成一個環，記錄隊首下標 head 和目前元素個數 count。
// 隊尾的下一格是 (head + count) % k，隊尾元素在 (head + count - 1) % k。
// 用 count 判斷空和滿，就不用特地空出一格來區分兩種狀態。
// 每個操作都是 O(1)，空間 O(k)。
public class MyCircularQueue {
    private int[] items;
    private int capacity;
    private int head;
    private int count;

    public MyCircularQueue(int k) {
        items = new int[k];
        capacity = k;
        head = 0;
        count = 0;
    }

    public bool EnQueue(int value) {
        if (IsFull()) {
            return false;
        }
        int tail = (head + count) % capacity;
        items[tail] = value;
        count++;
        return true;
    }

    public bool DeQueue() {
        if (IsEmpty()) {
            return false;
        }
        head = (head + 1) % capacity;
        count--;
        return true;
    }

    public int Front() {
        if (IsEmpty()) {
            return -1;
        }
        return items[head];
    }

    public int Rear() {
        if (IsEmpty()) {
            return -1;
        }
        int rear = (head + count - 1) % capacity;
        return items[rear];
    }

    public bool IsEmpty() {
        return count == 0;
    }

    public bool IsFull() {
        return count == capacity;
    }
}
