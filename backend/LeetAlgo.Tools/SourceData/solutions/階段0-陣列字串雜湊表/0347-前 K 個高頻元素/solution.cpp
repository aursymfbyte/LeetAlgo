// 先用雜湊表數出每個數字出現幾次，再做桶排序：buckets[f] 放出現 f 次的數字。
// 出現次數最多是 n，從 n 往下收集，收滿 k 個就是答案。
// 時間 O(n)，空間 O(n)。
class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        for (int num : nums) {
            count[num]++;
        }

        int n = nums.size();
        vector<vector<int>> buckets(n + 1);
        for (auto& entry : count) {
            buckets[entry.second].push_back(entry.first);
        }

        vector<int> result;
        for (int frequency = n; frequency > 0; frequency--) {
            for (int num : buckets[frequency]) {
                result.push_back(num);
                if ((int)result.size() == k) {
                    return result;
                }
            }
        }
        return result;
    }
};
