// 快慢指針：slow 每次走一步，fast 每次走兩步，fast 走到底時 slow 剛好在中間。
// 迴圈條件是 fast 和 fast->next 都不是 nullptr，節點數為偶數時 slow 會停在第二個中間節點。
// 時間 O(n)，空間 O(1)。
class Solution {
public:
    ListNode* middleNode(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast != nullptr && fast->next != nullptr) {
            slow = slow->next;
            fast = fast->next->next;
        }
        return slow;
    }
};
