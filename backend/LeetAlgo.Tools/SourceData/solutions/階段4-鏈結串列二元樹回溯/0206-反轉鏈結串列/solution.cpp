// 用 pre、cur、nxt 三個指針從頭走到尾：先用 nxt 記住 cur 的下一個節點，
// 再把 cur->next 改指向 pre，然後 pre 和 cur 各往後移一格。
// 走完時 cur 是 nullptr，pre 就是反轉後的新頭。
// 時間 O(n)，空間 O(1)。
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* pre = nullptr;
        ListNode* cur = head;
        while (cur != nullptr) {
            ListNode* nxt = cur->next;
            cur->next = pre;
            pre = cur;
            cur = nxt;
        }
        return pre;
    }
};
