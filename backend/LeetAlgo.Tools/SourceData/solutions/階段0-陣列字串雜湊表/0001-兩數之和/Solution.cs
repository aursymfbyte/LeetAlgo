// 用雜湊表記錄看過的數字和它的下標，每走到一個數，就查 target - num 有沒有出現過。
// 先查再存，才不會把同一個元素用兩次。
// 時間 O(n)，空間 O(n)。
public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        Dictionary<int, int> indexOf = new Dictionary<int, int>();
        for (int i = 0; i < nums.Length; i++) {
            int need = target - nums[i];
            if (indexOf.ContainsKey(need)) {
                return new int[] { indexOf[need], i };
            }
            indexOf[nums[i]] = i;
        }
        return new int[0];
    }
}
