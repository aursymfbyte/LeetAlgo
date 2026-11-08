// 先數出串列長度 length，剩下的節點還有 k 個以上才翻轉，不足 k 個的尾巴保持原樣。
// 每一組都是 92 的局部反轉：before 是這組前一個節點，從 before.next 開始用 pre / cur / nxt 反轉 k 個。
// 反轉完 pre 是這組的新頭、cur 是下一組的第一個節點；
// 原本這組的頭 before.next 變成這組的尾，讓它接上 cur，before 接上 pre。
// 這組的尾就是下一組的 before。用哨兵節點，第一組不用特判。
// 時間 O(n)，空間 O(1)。
public class Solution {
    public ListNode ReverseKGroup(ListNode head, int k) {
        int length = 0;
        ListNode node = head;
        while (node != null) {
            length++;
            node = node.next;
        }

        ListNode dummy = new ListNode(0, head);
        ListNode before = dummy;
        while (length >= k) {
            length -= k;
            ListNode pre = null;
            ListNode cur = before.next;
            for (int i = 0; i < k; i++) {
                ListNode nxt = cur.next;
                cur.next = pre;
                pre = cur;
                cur = nxt;
            }

            ListNode groupTail = before.next;
            groupTail.next = cur;
            before.next = pre;
            before = groupTail;
        }
        return dummy.next;
    }
}
