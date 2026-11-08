// 從左往右走，維護目前最遠能到達的位置 maxReach。
// 如果走到下標 i 時 i > maxReach，代表 i 根本到不了，後面也都到不了，回傳 false；
// 否則用 i + nums[i] 更新 maxReach。能走完整個陣列就代表最後一格到得了。
// 時間 O(n)，空間 O(1)。
bool canJump(int* nums, int numsSize) {
    int maxReach = 0;
    for (int i = 0; i < numsSize; i++) {
        if (i > maxReach) {
            return false;
        }
        if (i + nums[i] > maxReach) {
            maxReach = i + nums[i];
        }
    }
    return true;
}
