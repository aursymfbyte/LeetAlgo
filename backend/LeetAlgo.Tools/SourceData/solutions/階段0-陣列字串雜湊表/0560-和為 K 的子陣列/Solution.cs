// 子陣列和 = prefix[右] - prefix[左]，要等於 k，就是找之前出現過幾次 prefix - k。
// 用雜湊表記錄每個前綴和出現的次數，一開始放 {0: 1} 代表空的前綴。
// 要先查 prefix - k 再存目前的 prefix，否則 k = 0 時會把空子陣列也算進去。
// 時間 O(n)，空間 O(n)。
public class Solution {
    public int SubarraySum(int[] nums, int k) {
        Dictionary<int, int> prefixCount = new Dictionary<int, int>();
        prefixCount[0] = 1;
        int prefix = 0;
        int answer = 0;

        foreach (int num in nums) {
            prefix += num;
            if (prefixCount.ContainsKey(prefix - k)) {
                answer += prefixCount[prefix - k];
            }

            if (prefixCount.ContainsKey(prefix)) {
                prefixCount[prefix]++;
            } else {
                prefixCount[prefix] = 1;
            }
        }
        return answer;
    }
}
