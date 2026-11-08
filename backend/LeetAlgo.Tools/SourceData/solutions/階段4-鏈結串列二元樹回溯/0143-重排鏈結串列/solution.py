# 分三步：
# 1. 用 876 的快慢指針找到中間節點 middle（偶數個時取後面那個）。
# 2. 用 206 的方法把 middle 開始的後半段反轉，得到 Ln -> Ln-1 -> … -> middle。
# 3. 前半段從 head、後半段從反轉後的頭，一前一後交錯接起來。
# 前半段的最後一個節點仍然指著 middle，middle 也是反轉後後半段的最後一個節點，
# 所以當後半段只剩 middle（second.next 是 None）時就可以停，整條串列已經接好。
# 時間 O(n)，空間 O(1)。
class Solution:
    def middleNode(self, head: ListNode) -> ListNode:
        slow = head
        fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        return slow

    def reverseList(self, head: ListNode) -> ListNode:
        pre = None
        cur = head
        while cur:
            nxt = cur.next
            cur.next = pre
            pre = cur
            cur = nxt
        return pre

    def reorderList(self, head: ListNode | None) -> None:
        middle = self.middleNode(head)
        first = head
        second = self.reverseList(middle)
        while second.next:
            first_next = first.next
            second_next = second.next
            first.next = second
            second.next = first_next
            first = first_next
            second = second_next
