// 和 435 是對偶問題：一支箭能射爆的氣球彼此都有共同點，所求的箭數 = 最多能挑出幾個兩兩不相交的氣球。
// 按右端點排序，第一支箭射在第一個氣球的右端點，這是能同時射到最多後續氣球的位置。
// 往後看，左端點 ≤ 箭的位置的氣球都會被這支箭射爆（端點碰到也算）；
// 遇到左端點 > 箭的位置的氣球，就需要新的一支箭，射在它的右端點。
// 時間 O(n log n)，空間 O(log n)（排序用）。
class Solution {
public:
    int findMinArrowShots(vector<vector<int>>& points) {
        sort(points.begin(), points.end(), [](const vector<int>& a, const vector<int>& b) {
            return a[1] < b[1];
        });
        int n = points.size();
        int arrows = 1;
        int arrowPosition = points[0][1];
        for (int i = 1; i < n; i++) {
            if (points[i][0] > arrowPosition) {
                arrows++;
                arrowPosition = points[i][1];
            }
        }
        return arrows;
    }
};
