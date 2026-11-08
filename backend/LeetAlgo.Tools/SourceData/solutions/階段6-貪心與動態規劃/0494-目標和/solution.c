// 設所有數總和為 total，標成負號的那些數總和為 q，則 (total - q) - q = target，也就是 q = (total - target) / 2。
// 所以題目變成：從 nums 選出一些數，總和恰好為 q 的選法有幾種（0-1 背包求方案數）。
// total - target 是負數或奇數時無解，回傳 0。
// f[c] 表示目前看過的數中，選出總和恰好為 c 的方案數，f[0] = 1；每個數 num 讓 f[c] += f[c - num]。
// 容量要倒序枚舉，f[c - num] 才會是還沒用到 num 的舊值，確保每個數最多選一次。
// 時間 O(n · q)，空間 O(q)。
int findTargetSumWays(int* nums, int numsSize, int target) {
    int total = 0;
    for (int i = 0; i < numsSize; i++) {
        total += nums[i];
    }
    if (total - target < 0 || (total - target) % 2 == 1) {
        return 0;
    }
    int negativeSum = (total - target) / 2;

    int* f = calloc(negativeSum + 1, sizeof(int));
    f[0] = 1;
    for (int i = 0; i < numsSize; i++) {
        for (int c = negativeSum; c >= nums[i]; c--) {
            f[c] += f[c - nums[i]];
        }
    }

    int answer = f[negativeSum];
    free(f);
    return answer;
}
