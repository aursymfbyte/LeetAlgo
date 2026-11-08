# 先用雜湊表數出每個數字出現幾次，再做桶排序：buckets[f] 放出現 f 次的數字。
# 出現次數最多是 n，從 n 往下收集，收滿 k 個就是答案。
# 時間 O(n)，空間 O(n)。
class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        count = {}
        for num in nums:
            count[num] = count.get(num, 0) + 1

        buckets = [[] for _ in range(len(nums) + 1)]
        for num, frequency in count.items():
            buckets[frequency].append(num)

        result = []
        for frequency in range(len(nums), 0, -1):
            for num in buckets[frequency]:
                result.append(num)
                if len(result) == k:
                    return result
        return result
