// 從左往右走，維護目前最遠能到達的位置 maxReach。
// 如果走到下標 i 時 i > maxReach，代表 i 根本到不了，後面也都到不了，回傳 false；
// 否則用 i + nums[i] 更新 maxReach。能走完整個陣列就代表最後一格到得了。
// 時間 O(n)，空間 O(1)。
public class Solution {
    public bool CanJump(int[] nums) {
        int maxReach = 0;
        for (int i = 0; i < nums.Length; i++) {
            if (i > maxReach) {
                return false;
            }
            maxReach = Math.Max(maxReach, i + nums[i]);
        }
        return true;
    }
}
