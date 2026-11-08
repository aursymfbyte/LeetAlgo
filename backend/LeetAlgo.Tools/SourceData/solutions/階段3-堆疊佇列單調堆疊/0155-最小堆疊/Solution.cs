// 除了存放元素的堆疊 values，再開一個同步的堆疊 mins：
// mins 的每一層記錄「從底部到這一層為止的最小值」，push 和 pop 時兩個堆疊一起動。
// 這樣不管彈出多少次，mins 的頂端永遠是目前堆疊裡的最小值。
// 每個操作 O(1)，空間 O(n)。
public class MinStack {
    private Stack<int> values;
    private Stack<int> mins;

    public MinStack() {
        values = new Stack<int>();
        mins = new Stack<int>();
    }

    public void Push(int value) {
        values.Push(value);
        if (mins.Count == 0) {
            mins.Push(value);
        } else {
            mins.Push(Math.Min(value, mins.Peek()));
        }
    }

    public void Pop() {
        values.Pop();
        mins.Pop();
    }

    public int Top() {
        return values.Peek();
    }

    public int GetMin() {
        return mins.Peek();
    }
}
