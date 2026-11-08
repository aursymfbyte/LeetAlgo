// 對頂堆：較小的一半放在最大堆 lower，較大的一半放在最小堆 upper，
// 並維持 lower 的個數等於 upper，或比 upper 多 1。
// 加入新數時先放進 lower，再把 lower 最大的移到 upper，保證 lower 的數都不大於 upper 的數；
// 若 upper 因此比 lower 多，再把 upper 最小的移回 lower。
// 中位數就是 lower 的堆頂（總數為奇數），或兩個堆頂的平均（總數為偶數）。
// addNum O(log n)，findMedian O(1)，空間 O(n)。
class MedianFinder {
private:
    priority_queue<int> lower;
    priority_queue<int, vector<int>, greater<int>> upper;

public:
    MedianFinder() {
    }

    void addNum(int num) {
        lower.push(num);
        upper.push(lower.top());
        lower.pop();
        if (upper.size() > lower.size()) {
            lower.push(upper.top());
            upper.pop();
        }
    }

    double findMedian() {
        if (lower.size() > upper.size()) {
            return lower.top();
        }
        return (lower.top() + upper.top()) / 2.0;
    }
};
