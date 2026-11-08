// 用兩個堆疊：push 一律放進 inStack；要取最前面的元素時，從 outStack 的頂端拿。
// outStack 空了才把 inStack 全部倒過去，倒過去後順序剛好反轉，最早進來的就在頂端。
// 每個元素最多被搬一次，所以每個操作均攤 O(1)，空間 O(n)。
public class MyQueue {
    private Stack<int> inStack;
    private Stack<int> outStack;

    public MyQueue() {
        inStack = new Stack<int>();
        outStack = new Stack<int>();
    }

    public void Push(int x) {
        inStack.Push(x);
    }

    public int Pop() {
        MoveIfNeeded();
        return outStack.Pop();
    }

    public int Peek() {
        MoveIfNeeded();
        return outStack.Peek();
    }

    public bool Empty() {
        return inStack.Count == 0 && outStack.Count == 0;
    }

    private void MoveIfNeeded() {
        if (outStack.Count == 0) {
            while (inStack.Count > 0) {
                outStack.Push(inStack.Pop());
            }
        }
    }
}
