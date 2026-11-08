// 用集合記錄看過的數字，遇到已經在集合裡的數字就代表有重複。
// 時間 O(n)，空間 O(n)。
public class Solution {
    public bool ContainsDuplicate(int[] nums) {
        HashSet<int> seen = new HashSet<int>();
        foreach (int num in nums) {
            if (seen.Contains(num)) {
                return true;
            }
            seen.Add(num);
        }
        return false;
    }
}
