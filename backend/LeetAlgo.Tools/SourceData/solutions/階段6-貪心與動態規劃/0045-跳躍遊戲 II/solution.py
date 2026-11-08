# 「造橋」的想法：current_end 是目前這座橋（已用的跳躍次數）能走到的最遠位置，
# next_end 是在橋上任何一點起跳後、下一座橋最遠能蓋到哪裡。
# 一邊走一邊用 i + nums[i] 更新 next_end；走到橋尾（i == current_end）時才不得不再跳一次，
# 這時跳躍次數加一，並把橋延伸到 next_end。
# 只走到 n - 2：抵達最後一格就不用再跳，否則當 current_end 剛好在 n - 1 時會多算一次。
# 時間 O(n)，空間 O(1)。
class Solution:
    def jump(self, nums: list[int]) -> int:
        answer = 0
        current_end = 0
        next_end = 0
        for i in range(len(nums) - 1):
            next_end = max(next_end, i + nums[i])
            if i == current_end:
                answer += 1
                current_end = next_end
        return answer
