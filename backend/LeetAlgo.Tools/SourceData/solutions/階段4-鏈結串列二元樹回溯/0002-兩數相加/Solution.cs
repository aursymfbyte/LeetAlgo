// 數字是倒著存的，串列的頭就是個位數，所以可以像直式加法一樣從頭往後逐位相加。
// 每一位把兩條串列目前的數字和進位加起來，個位數 total % 10 接成新節點，進位 total / 10 留給下一位。
// 兩條串列都走完、而且沒有進位時才停止，最後多出來的進位也會變成一個節點。
// 用哨兵節點 dummy 接結果，就不用特別處理第一個節點。
// 時間 O(max(m, n))，空間 O(1)（不算回傳的串列）。
public class Solution {
    public ListNode AddTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode();
        ListNode tail = dummy;
        int carry = 0;
        while (l1 != null || l2 != null || carry != 0) {
            int total = carry;
            if (l1 != null) {
                total += l1.val;
                l1 = l1.next;
            }
            if (l2 != null) {
                total += l2.val;
                l2 = l2.next;
            }
            tail.next = new ListNode(total % 10);
            tail = tail.next;
            carry = total / 10;
        }
        return dummy.next;
    }
}
