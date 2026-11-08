# 快慢指針：slow 每次走一步，fast 每次走兩步，fast 走到底時 slow 剛好在中間。
# 迴圈條件是 fast 和 fast.next 都存在，節點數為偶數時 slow 會停在第二個中間節點。
# 時間 O(n)，空間 O(1)。
class Solution:
    def middleNode(self, head: ListNode | None) -> ListNode | None:
        slow = head
        fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        return slow
