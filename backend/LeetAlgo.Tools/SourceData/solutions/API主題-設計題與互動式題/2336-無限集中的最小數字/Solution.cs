// 用 nextNumber 表示「大於等於它的整數都還在集合裡、從沒被拿走過」。
// 被拿走後又加回來、而且比 nextNumber 小的數，放進最小堆；另外用集合記錄堆裡有哪些數，避免重複加入。
// PopSmallest 時，堆裡的數一定都比 nextNumber 小，所以堆不空就先彈堆頂，否則回傳 nextNumber 並往後移。
// 每次操作 O(log m)，空間 O(m)，m 是加回來的數字個數。
public class SmallestInfiniteSet {
    private int nextNumber;
    private PriorityQueue<int, int> heap;
    private HashSet<int> inHeap;

    public SmallestInfiniteSet() {
        nextNumber = 1;
        heap = new PriorityQueue<int, int>();
        inHeap = new HashSet<int>();
    }

    public int PopSmallest() {
        if (heap.Count > 0) {
            int smallest = heap.Dequeue();
            inHeap.Remove(smallest);
            return smallest;
        }
        int answer = nextNumber;
        nextNumber++;
        return answer;
    }

    public void AddBack(int num) {
        if (num >= nextNumber || inHeap.Contains(num)) {
            return;
        }
        heap.Enqueue(num, num);
        inHeap.Add(num);
    }
}
