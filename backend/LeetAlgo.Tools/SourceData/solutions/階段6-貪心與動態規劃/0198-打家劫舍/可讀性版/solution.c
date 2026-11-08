// 選或不選：f[i] 表示只考慮前 i 間房子（nums[0] 到 nums[i - 1]）最多能偷多少。
// 不偷第 i 間就是 f[i - 1]；偷第 i 間就不能偷第 i - 1 間，是 f[i - 2] + nums[i - 1]，兩者取大。
// 起點 f[0] = 0、f[1] = nums[0]，答案是 f[n]。
// 時間 O(n)，空間 O(n)。
int maxInt(int a, int b) {
    if (a > b) {
        return a;
    }
    return b;
}

int rob(int* nums, int numsSize) {
    int n = numsSize;
    int* f = malloc(sizeof(int) * (n + 1));
    f[0] = 0;
    f[1] = nums[0];
    for (int i = 2; i <= n; i++) {
        f[i] = maxInt(f[i - 1], f[i - 2] + nums[i - 1]);
    }

    int answer = f[n];
    free(f);
    return answer;
}
