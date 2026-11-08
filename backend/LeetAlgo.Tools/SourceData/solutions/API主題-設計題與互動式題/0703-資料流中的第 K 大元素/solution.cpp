// 維護一個最多 k 個元素的最小堆，裡面放的是目前最大的 k 個數。
// 每加入一個數就放進堆，堆超過 k 個就把最小的彈掉；堆頂就是第 k 大。
// 建構 O(n log k)，每次 add O(log k)，空間 O(k)。
class KthLargest {
private:
    int k;
    priority_queue<int, vector<int>, greater<int>> heap;

public:
    KthLargest(int k, vector<int>& nums) {
        this->k = k;
        for (int num : nums) {
            add(num);
        }
    }

    int add(int val) {
        heap.push(val);
        int size = heap.size();
        if (size > k) {
            heap.pop();
        }
        return heap.top();
    }
};
