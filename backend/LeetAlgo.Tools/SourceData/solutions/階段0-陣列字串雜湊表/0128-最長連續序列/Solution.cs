// 把數字放進集合。只有當 num - 1 不在集合裡時，num 才是一段連續序列的起點，
// 從起點往上數 num + 1、num + 2…… 直到中斷。每個數最多被數到一次。
// 時間 O(n)，空間 O(n)。
public class Solution {
    public int LongestConsecutive(int[] nums) {
        HashSet<int> numSet = new HashSet<int>(nums);
        int longest = 0;
        foreach (int num in numSet) {
            if (numSet.Contains(num - 1)) {
                continue;
            }

            int current = num;
            int length = 1;
            while (numSet.Contains(current + 1)) {
                current++;
                length++;
            }
            longest = Math.Max(longest, length);
        }
        return longest;
    }
}
