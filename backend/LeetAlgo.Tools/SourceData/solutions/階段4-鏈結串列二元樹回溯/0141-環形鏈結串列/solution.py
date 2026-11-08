# 快慢指針：slow 每次走一步，fast 每次走兩步。
# 沒有環的話 fast 一定會先走到 None；有環的話兩個都會進到環裡繞，
# 每走一輪 fast 就追近 slow 一步，所以一定會相遇。
# 時間 O(n)，空間 O(1)。
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = head
        fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                return True
        return False
