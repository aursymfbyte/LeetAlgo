// 對頂堆：較小的一半放在最大堆 lower，較大的一半放在最小堆 upper，
// 並維持 lower 的個數等於 upper，或比 upper 多 1。
// 加入新數時先放進 lower，再把 lower 最大的移到 upper，保證 lower 的數都不大於 upper 的數；
// 若 upper 因此比 lower 多，再把 upper 最小的移回 lower。
// 中位數就是 lower 的堆頂（總數為奇數），或兩個堆頂的平均（總數為偶數）。
// AddNum O(log n)，FindMedian O(1)，空間 O(n)。
public class MedianFinder {
    private PriorityQueue<int, int> lower;
    private PriorityQueue<int, int> upper;

    public MedianFinder() {
        lower = new PriorityQueue<int, int>();
        upper = new PriorityQueue<int, int>();
    }

    public void AddNum(int num) {
        lower.Enqueue(num, -num);
        int largestOfLower = lower.Dequeue();
        upper.Enqueue(largestOfLower, largestOfLower);
        if (upper.Count > lower.Count) {
            int smallestOfUpper = upper.Dequeue();
            lower.Enqueue(smallestOfUpper, -smallestOfUpper);
        }
    }

    public double FindMedian() {
        if (lower.Count > upper.Count) {
            return lower.Peek();
        }
        return (lower.Peek() + upper.Peek()) / 2.0;
    }
}
