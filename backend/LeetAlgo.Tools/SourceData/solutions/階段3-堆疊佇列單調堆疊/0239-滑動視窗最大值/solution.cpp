// 單調佇列：雙端佇列裡放下標，對應的值由前到後嚴格遞減，最前面就是目前視窗的最大值。
// 新元素 nums[i] 進來時，從尾端彈出所有 <= 它的元素，因為它們比 nums[i] 早離開又不比它大，不可能再當最大值。
// 前端的下標如果已經滑出視窗（<= i - k），就從前端彈出。
// 視窗湊滿 k 個之後，每一步的答案就是前端對應的值。
// 每個下標最多進出佇列一次，時間 O(n)，空間 O(k)。
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        int n = nums.size();
        deque<int> window;
        vector<int> answer;

        for (int i = 0; i < n; i++) {
            while (!window.empty() && nums[window.back()] <= nums[i]) {
                window.pop_back();
            }
            window.push_back(i);

            if (window.front() <= i - k) {
                window.pop_front();
            }

            if (i >= k - 1) {
                answer.push_back(nums[window.front()]);
            }
        }
        return answer;
    }
};
