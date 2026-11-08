// 子陣列和 = prefix[右] - prefix[左]，要等於 k，就是找之前出現過幾次 prefix - k。
// 用雜湊表記錄每個前綴和出現的次數，一開始放 {0: 1} 代表空的前綴。
// 要先查 prefix - k 再存目前的 prefix，否則 k = 0 時會把空子陣列也算進去。
// 時間 O(n)，空間 O(n)。
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> prefixCount;
        prefixCount[0] = 1;
        int prefix = 0;
        int answer = 0;

        for (int num : nums) {
            prefix += num;
            if (prefixCount.count(prefix - k) > 0) {
                answer += prefixCount[prefix - k];
            }
            prefixCount[prefix]++;
        }
        return answer;
    }
};
