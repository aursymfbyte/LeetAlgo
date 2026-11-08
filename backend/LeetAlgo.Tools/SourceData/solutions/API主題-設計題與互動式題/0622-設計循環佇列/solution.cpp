// 用長度 k 的陣列當成一個環，記錄隊首下標 head 和目前元素個數 count。
// 隊尾的下一格是 (head + count) % k，隊尾元素在 (head + count - 1) % k。
// 用 count 判斷空和滿，就不用特地空出一格來區分兩種狀態。
// 每個操作都是 O(1)，空間 O(k)。
class MyCircularQueue {
private:
    vector<int> items;
    int capacity;
    int head;
    int count;

public:
    MyCircularQueue(int k) {
        items.assign(k, 0);
        capacity = k;
        head = 0;
        count = 0;
    }

    bool enQueue(int value) {
        if (isFull()) {
            return false;
        }
        int tail = (head + count) % capacity;
        items[tail] = value;
        count++;
        return true;
    }

    bool deQueue() {
        if (isEmpty()) {
            return false;
        }
        head = (head + 1) % capacity;
        count--;
        return true;
    }

    int Front() {
        if (isEmpty()) {
            return -1;
        }
        return items[head];
    }

    int Rear() {
        if (isEmpty()) {
            return -1;
        }
        int rear = (head + count - 1) % capacity;
        return items[rear];
    }

    bool isEmpty() {
        return count == 0;
    }

    bool isFull() {
        return count == capacity;
    }
};
