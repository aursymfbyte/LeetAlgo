// 維護一個最多 k 個元素的最小堆，裡面放的是目前最大的 k 個數。
// 每加入一個數就放進堆，堆超過 k 個就把最小的彈掉；堆頂就是第 k 大。
// 建構 O(n log k)，每次 add O(log k)，空間 O(k)。
public class KthLargest {
    private int k;
    private PriorityQueue<int, int> heap;

    public KthLargest(int k, int[] nums) {
        this.k = k;
        heap = new PriorityQueue<int, int>();
        foreach (int num in nums) {
            Add(num);
        }
    }

    public int Add(int val) {
        heap.Enqueue(val, val);
        if (heap.Count > k) {
            heap.Dequeue();
        }
        return heap.Peek();
    }
}
