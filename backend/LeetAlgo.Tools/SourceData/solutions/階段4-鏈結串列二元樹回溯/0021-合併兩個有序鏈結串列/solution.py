# 建一個哨兵節點 dummy，用 tail 指向目前合併結果的最後一個節點。
# 每次比較兩條串列的頭，把比較小的接到 tail 後面，該串列往後走一格。
# 其中一條走完後，另一條剩下的部分本來就有序，直接整段接上。
# 有哨兵節點就不用特別處理「結果的第一個節點是誰」。
# 時間 O(m + n)，空間 O(1)。
class Solution:
    def mergeTwoLists(self, list1: ListNode | None, list2: ListNode | None) -> ListNode | None:
        dummy = ListNode()
        tail = dummy
        while list1 and list2:
            if list1.val <= list2.val:
                tail.next = list1
                list1 = list1.next
            else:
                tail.next = list2
                list2 = list2.next
            tail = tail.next

        if list1:
            tail.next = list1
        else:
            tail.next = list2
        return dummy.next
