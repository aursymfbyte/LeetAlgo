// 和 435 是對偶問題：一支箭能射爆的氣球彼此都有共同點，所求的箭數 = 最多能挑出幾個兩兩不相交的氣球。
// 按右端點排序，第一支箭射在第一個氣球的右端點，這是能同時射到最多後續氣球的位置。
// 往後看，左端點 ≤ 箭的位置的氣球都會被這支箭射爆（端點碰到也算）；
// 遇到左端點 > 箭的位置的氣球，就需要新的一支箭，射在它的右端點。
// 座標可能是 int 的最小與最大值，排序比較時不能用相減，否則會溢位。
// 時間 O(n log n)，空間 O(log n)（排序用）。
int compareByEnd(const void* a, const void* b) {
    const int* first = *(const int**)a;
    const int* second = *(const int**)b;
    if (first[1] < second[1]) {
        return -1;
    }
    if (first[1] > second[1]) {
        return 1;
    }
    return 0;
}

int findMinArrowShots(int** points, int pointsSize, int* pointsColSize) {
    qsort(points, pointsSize, sizeof(int*), compareByEnd);
    int arrows = 1;
    int arrowPosition = points[0][1];
    for (int i = 1; i < pointsSize; i++) {
        if (points[i][0] > arrowPosition) {
            arrows++;
            arrowPosition = points[i][1];
        }
    }
    return arrows;
}
