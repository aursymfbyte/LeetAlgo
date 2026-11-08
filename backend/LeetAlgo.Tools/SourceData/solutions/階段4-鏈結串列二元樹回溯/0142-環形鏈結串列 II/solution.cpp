// 先用 141 的快慢指針找到相遇點。設頭到入環點距離 a、入環點到相遇點距離 b、環長 c。
// fast 走的步數是 slow 的兩倍：2(a + b) = a + b + k * c，所以 a = (k - 1) * c + (c - b)。
// 也就是說，從相遇點再走 a 步會剛好回到入環點。
// 讓 entry 從頭出發、slow 從相遇點出發，每次各走一步，兩者相遇的地方就是入環點。
// 時間 O(n)，空間 O(1)。
class Solution {
public:
    ListNode *detectCycle(ListNode *head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast != nullptr && fast->next != nullptr) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) {
                ListNode* entry = head;
                while (entry != slow) {
                    entry = entry->next;
                    slow = slow->next;
                }
                return entry;
            }
        }
        return nullptr;
    }
};
