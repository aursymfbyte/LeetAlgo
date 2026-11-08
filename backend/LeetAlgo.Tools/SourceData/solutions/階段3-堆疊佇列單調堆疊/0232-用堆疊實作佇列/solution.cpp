// 用兩個堆疊：push 一律放進 inStack；要取最前面的元素時，從 outStack 的頂端拿。
// outStack 空了才把 inStack 全部倒過去，倒過去後順序剛好反轉，最早進來的就在頂端。
// 每個元素最多被搬一次，所以每個操作均攤 O(1)，空間 O(n)。
class MyQueue {
private:
    stack<int> inStack;
    stack<int> outStack;

    void moveIfNeeded() {
        if (outStack.empty()) {
            while (!inStack.empty()) {
                outStack.push(inStack.top());
                inStack.pop();
            }
        }
    }

public:
    MyQueue() {
    }

    void push(int x) {
        inStack.push(x);
    }

    int pop() {
        moveIfNeeded();
        int front = outStack.top();
        outStack.pop();
        return front;
    }

    int peek() {
        moveIfNeeded();
        return outStack.top();
    }

    bool empty() {
        return inStack.empty() && outStack.empty();
    }
};
