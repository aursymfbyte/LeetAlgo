# 把 gas[i] - cost[i] 當成經過第 i 站後油量的變化，假設從第 0 站出發且油量可以暫時是負的，一路累加得到前綴和 total。
# 從前綴和最低點的下一站出發，等於把最大的虧損留到最後才承受；只要總和 ≥ 0，沿途油量都不會變成負的。
# 因此答案是前綴和最低點的下一站；總和 total < 0 代表油不夠繞一圈，回傳 -1。
# 最低點若出現在最後一站，總和一定 < 0，所以不會回傳 n 這個不存在的下標。
# 時間 O(n)，空間 O(1)。
class Solution:
    def canCompleteCircuit(self, gas: list[int], cost: list[int]) -> int:
        answer = 0
        total = 0
        min_total = 0
        for i in range(len(gas)):
            total += gas[i] - cost[i]
            if total < min_total:
                min_total = total
                answer = i + 1
        if total < 0:
            return -1
        return answer
