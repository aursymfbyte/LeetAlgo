// 先從哨兵節點 dummy 走 left - 1 步，停在要反轉的區段前一個節點 before。
// 從 before->next 開始，用 206 的 pre / cur / nxt 反轉 right - left + 1 個節點。
// 反轉完 pre 是這段的新頭，cur 是這段後面的第一個節點；
// 原本這段的頭 before->next 現在變成段尾，要接上 cur，before 再接上 pre，整段就接回去了。
// 有哨兵節點，left = 1 時也不用特判。
// 只走一趟，時間 O(n)，空間 O(1)。
class Solution {
public:
    ListNode* reverseBetween(ListNode* head, int left, int right) {
        ListNode dummy(0, head);
        ListNode* before = &dummy;
        for (int i = 0; i < left - 1; i++) {
            before = before->next;
        }

        ListNode* pre = nullptr;
        ListNode* cur = before->next;
        for (int i = 0; i < right - left + 1; i++) {
            ListNode* nxt = cur->next;
            cur->next = pre;
            pre = cur;
            cur = nxt;
        }

        ListNode* segmentTail = before->next;
        segmentTail->next = cur;
        before->next = pre;
        return dummy.next;
    }
};
