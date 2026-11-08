# 要刪掉倒數第 n 個節點，得先找到它的前一個節點（倒數第 n + 1 個）。
# 前後指針都從哨兵節點 dummy 出發，front 先走 n 步，接著兩個一起走，
# 直到 front 停在最後一個節點，這時 back 和 front 相差 n 步，back 剛好在要刪除節點的前一個。
# 有哨兵節點，刪掉的是第一個節點時也不用特判。
# 只走一趟，時間 O(n)，空間 O(1)。
class Solution:
    def removeNthFromEnd(self, head: ListNode | None, n: int) -> ListNode | None:
        dummy = ListNode(0, head)
        front = dummy
        for _ in range(n):
            front = front.next

        back = dummy
        while front.next:
            front = front.next
            back = back.next

        back.next = back.next.next
        return dummy.next
