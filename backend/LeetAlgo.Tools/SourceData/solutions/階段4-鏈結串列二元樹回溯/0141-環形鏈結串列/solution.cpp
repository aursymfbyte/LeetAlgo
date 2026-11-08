// 快慢指針：slow 每次走一步，fast 每次走兩步。
// 沒有環的話 fast 一定會先走到 nullptr；有環的話兩個都會進到環裡繞，
// 每走一輪 fast 就追近 slow 一步，所以一定會相遇。
// 時間 O(n)，空間 O(1)。
class Solution {
public:
    bool hasCycle(ListNode *head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast != nullptr && fast->next != nullptr) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) {
                return true;
            }
        }
        return false;
    }
};
