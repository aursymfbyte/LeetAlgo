// 按左端點排序後，可以和目前區間重疊的區間一定緊接在它後面。
// 依序處理每個區間：如果它的左端點 ≤ 答案中最後一個區間的右端點，就重疊（端點相接也算），
// 把最後一個區間的右端點更新成兩者較大的那個；否則它和前面都不重疊，直接當成新區間加入答案。
// 時間 O(n log n)，空間 O(log n)（排序用，不計答案）。
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end(), [](const vector<int>& a, const vector<int>& b) {
            return a[0] < b[0];
        });
        vector<vector<int>> merged;
        for (const vector<int>& interval : intervals) {
            if (!merged.empty() && interval[0] <= merged.back()[1]) {
                merged.back()[1] = max(merged.back()[1], interval[1]);
            } else {
                merged.push_back(interval);
            }
        }
        return merged;
    }
};
