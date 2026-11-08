// 除了存放元素的堆疊 values，再開一個同步的堆疊 mins：
// mins 的每一層記錄「從底部到這一層為止的最小值」，push 和 pop 時兩個堆疊一起動。
// 這樣不管彈出多少次，mins 的頂端永遠是目前堆疊裡的最小值。
// 每個操作 O(1)，空間 O(n)。
class MinStack {
private:
    stack<int> values;
    stack<int> mins;

public:
    MinStack() {
    }

    void push(int value) {
        values.push(value);
        if (mins.empty()) {
            mins.push(value);
        } else {
            mins.push(min(value, mins.top()));
        }
    }

    void pop() {
        values.pop();
        mins.pop();
    }

    int top() {
        return values.top();
    }

    int getMin() {
        return mins.top();
    }
};
