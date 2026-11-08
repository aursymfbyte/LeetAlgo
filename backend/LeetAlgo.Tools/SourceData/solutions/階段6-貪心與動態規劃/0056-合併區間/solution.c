// 按左端點排序後，可以和目前區間重疊的區間一定緊接在它後面。
// 依序處理每個區間：如果它的左端點 ≤ 答案中最後一個區間的右端點，就重疊（端點相接也算），
// 把最後一個區間的右端點更新成兩者較大的那個；否則它和前面都不重疊，直接當成新區間加入答案。
// 時間 O(n log n)，空間 O(log n)（排序用，不計答案）。
int compareByStart(const void* a, const void* b) {
    const int* first = *(const int**)a;
    const int* second = *(const int**)b;
    if (first[0] < second[0]) {
        return -1;
    }
    if (first[0] > second[0]) {
        return 1;
    }
    return 0;
}

int** merge(int** intervals, int intervalsSize, int* intervalsColSize, int* returnSize, int** returnColumnSizes) {
    qsort(intervals, intervalsSize, sizeof(int*), compareByStart);

    int** merged = malloc(sizeof(int*) * intervalsSize);
    *returnColumnSizes = malloc(sizeof(int) * intervalsSize);
    int count = 0;
    for (int i = 0; i < intervalsSize; i++) {
        int start = intervals[i][0];
        int end = intervals[i][1];
        if (count > 0 && start <= merged[count - 1][1]) {
            if (end > merged[count - 1][1]) {
                merged[count - 1][1] = end;
            }
        } else {
            merged[count] = malloc(sizeof(int) * 2);
            merged[count][0] = start;
            merged[count][1] = end;
            (*returnColumnSizes)[count] = 2;
            count++;
        }
    }
    *returnSize = count;
    return merged;
}
