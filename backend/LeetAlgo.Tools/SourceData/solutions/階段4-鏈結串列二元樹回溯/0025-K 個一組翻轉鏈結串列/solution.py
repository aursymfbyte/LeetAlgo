# 先數出串列長度 length，剩下的節點還有 k 個以上才翻轉，不足 k 個的尾巴保持原樣。
# 每一組都是 92 的局部反轉：before 是這組前一個節點，從 before.next 開始用 pre / cur / nxt 反轉 k 個。
# 反轉完 pre 是這組的新頭、cur 是下一組的第一個節點；
# 原本這組的頭 before.next 變成這組的尾，讓它接上 cur，before 接上 pre。
# 這組的尾就是下一組的 before。用哨兵節點，第一組不用特判。
# 時間 O(n)，空間 O(1)。
class Solution:
    def reverseKGroup(self, head: ListNode | None, k: int) -> ListNode | None:
        length = 0
        node = head
        while node:
            length += 1
            node = node.next

        dummy = ListNode(0, head)
        before = dummy
        while length >= k:
            length -= k
            pre = None
            cur = before.next
            for _ in range(k):
                nxt = cur.next
                cur.next = pre
                pre = cur
                cur = nxt

            group_tail = before.next
            group_tail.next = cur
            before.next = pre
            before = group_tail
        return dummy.next
