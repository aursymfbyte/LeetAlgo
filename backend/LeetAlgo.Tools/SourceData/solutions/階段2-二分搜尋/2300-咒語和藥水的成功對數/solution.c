// 把 potions 由小到大排序後，對同一個咒語 spell，乘積 >= success 的藥水會是排序後的一段後綴。
// 對每個咒語用開區間 (left, right) 二分，找第一個 spell * potions[mid] >= success 的位置 index，
// 成功的藥水數就是 m - index。
// 時間 O((n + m) log m)；不算排序和回傳陣列，空間 O(1)。
int compareInts(const void* a, const void* b) {
    int x = *(const int*)a;
    int y = *(const int*)b;
    if (x < y) {
        return -1;
    }
    if (x > y) {
        return 1;
    }
    return 0;
}

int firstSuccessIndex(int* potions, int potionsSize, int spell, long long success) {
    int left = -1;
    int right = potionsSize;
    while (left + 1 < right) {
        int mid = left + (right - left) / 2;
        if ((long long)spell * potions[mid] >= success) {
            right = mid;
        } else {
            left = mid;
        }
    }
    return right;
}

int* successfulPairs(int* spells, int spellsSize, int* potions, int potionsSize, long long success, int* returnSize) {
    qsort(potions, potionsSize, sizeof(int), compareInts);

    int* pairs = malloc(sizeof(int) * spellsSize);
    for (int i = 0; i < spellsSize; i++) {
        int index = firstSuccessIndex(potions, potionsSize, spells[i], success);
        pairs[i] = potionsSize - index;
    }
    *returnSize = spellsSize;
    return pairs;
}
