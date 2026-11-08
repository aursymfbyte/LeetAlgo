// 把 potions 由小到大排序後，對同一個咒語 spell，乘積 >= success 的藥水會是排序後的一段後綴。
// 對每個咒語用開區間 (left, right) 二分，找第一個 spell * potions[mid] >= success 的位置 index，
// 成功的藥水數就是 m - index。
// 時間 O((n + m) log m)；不算排序和回傳陣列，空間 O(1)。
class Solution {
public:
    vector<int> successfulPairs(vector<int>& spells, vector<int>& potions, long long success) {
        sort(potions.begin(), potions.end());
        int m = potions.size();
        vector<int> pairs;
        for (int spell : spells) {
            int index = firstSuccessIndex(potions, spell, success);
            pairs.push_back(m - index);
        }
        return pairs;
    }

private:
    int firstSuccessIndex(vector<int>& potions, int spell, long long success) {
        int left = -1;
        int right = potions.size();
        while (left + 1 < right) {
            int mid = left + (right - left) / 2;
            if ((long long)spell * potions[mid] >= success) {
                right = mid;
            } else {
                left = mid;
            }
        }
        return right;
    }
};
