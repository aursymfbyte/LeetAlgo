// 先用雜湊表數出每個數字出現幾次，再做桶排序：buckets[f] 放出現 f 次的數字。
// 出現次數最多是 n，從 n 往下收集，收滿 k 個就是答案。
// 時間 O(n)，空間 O(n)。
public class Solution {
    public int[] TopKFrequent(int[] nums, int k) {
        Dictionary<int, int> count = new Dictionary<int, int>();
        foreach (int num in nums) {
            if (count.ContainsKey(num)) {
                count[num]++;
            } else {
                count[num] = 1;
            }
        }

        List<int>[] buckets = new List<int>[nums.Length + 1];
        for (int i = 0; i <= nums.Length; i++) {
            buckets[i] = new List<int>();
        }
        foreach (KeyValuePair<int, int> entry in count) {
            buckets[entry.Value].Add(entry.Key);
        }

        int[] result = new int[k];
        int filled = 0;
        for (int frequency = nums.Length; frequency > 0; frequency--) {
            foreach (int num in buckets[frequency]) {
                result[filled] = num;
                filled++;
                if (filled == k) {
                    return result;
                }
            }
        }
        return result;
    }
}
