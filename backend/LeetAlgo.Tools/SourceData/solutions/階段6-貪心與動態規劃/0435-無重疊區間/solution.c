// 反過來想：最少移除幾個 = 總數 - 最多能保留幾個互不重疊的區間。
// 按右端點排序，每次都保留「右端點最小」且不和上一個保留區間重疊的區間，
// 右端點越小，留給後面區間的空間越大，這樣保留的數量最多。
// 左端點 ≥ 上一個保留區間的右端點就不重疊（端點相接不算重疊）。
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

int eraseOverlapIntervals(int** intervals, int intervalsSize, int* intervalsColSize) {
    qsort(intervals, intervalsSize, sizeof(int*), compareByEnd);
    int kept = 1;
    int lastEnd = intervals[0][1];
    for (int i = 1; i < intervalsSize; i++) {
        if (intervals[i][0] >= lastEnd) {
            kept++;
            lastEnd = intervals[i][1];
        }
    }
    return intervalsSize - kept;
}
