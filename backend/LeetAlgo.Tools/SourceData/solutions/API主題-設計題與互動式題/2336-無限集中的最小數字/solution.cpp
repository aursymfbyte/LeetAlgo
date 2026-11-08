// 用 nextNumber 表示「大於等於它的整數都還在集合裡、從沒被拿走過」。
// 被拿走後又加回來、而且比 nextNumber 小的數，放進最小堆；另外用集合記錄堆裡有哪些數，避免重複加入。
// popSmallest 時，堆裡的數一定都比 nextNumber 小，所以堆不空就先彈堆頂，否則回傳 nextNumber 並往後移。
// 每次操作 O(log m)，空間 O(m)，m 是加回來的數字個數。
class SmallestInfiniteSet {
private:
    int nextNumber;
    priority_queue<int, vector<int>, greater<int>> heap;
    unordered_set<int> inHeap;

public:
    SmallestInfiniteSet() {
        nextNumber = 1;
    }

    int popSmallest() {
        if (!heap.empty()) {
            int smallest = heap.top();
            heap.pop();
            inHeap.erase(smallest);
            return smallest;
        }
        int answer = nextNumber;
        nextNumber++;
        return answer;
    }

    void addBack(int num) {
        if (num >= nextNumber || inHeap.count(num) > 0) {
            return;
        }
        heap.push(num);
        inHeap.insert(num);
    }
};
