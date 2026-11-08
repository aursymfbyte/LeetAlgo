// 指針 a 從 headA 出發，走完 A 之後改從 headB 繼續走；指針 b 從 headB 出發，走完 B 之後改從 headA 繼續走。
// 設 A 獨有的部分長 x、B 獨有的部分長 y、共同部分長 z，兩個指針都走了 x + y + z 步時會同時到達交點。
// 沒有交點時（z = 0），兩個指針會在各走 x + y 步後同時變成 nullptr，迴圈一樣會結束。
// 時間 O(m + n)，空間 O(1)。
class Solution {
public:
    ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {
        ListNode* a = headA;
        ListNode* b = headB;
        while (a != b) {
            if (a != nullptr) {
                a = a->next;
            } else {
                a = headB;
            }
            if (b != nullptr) {
                b = b->next;
            } else {
                b = headA;
            }
        }
        return a;
    }
};
