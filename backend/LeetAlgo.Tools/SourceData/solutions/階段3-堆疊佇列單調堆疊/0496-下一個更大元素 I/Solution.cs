// 先用單調堆疊算出 nums2 每個數的下一個更大元素：堆疊裡放還沒找到答案的數，由底到頂遞減，
// 新來的數比頂端大，頂端的答案就是它，彈出並記到雜湊表；沒被彈出的數答案就是 -1。
// 因為所有數字都不重複，可以直接用數值當雜湊表的 key，nums1 的每個查詢就是查表。
// 時間 O(m + n)，空間 O(n)，n 是 nums2 的長度，m 是 nums1 的長度。
public class Solution {
    public int[] NextGreaterElement(int[] nums1, int[] nums2) {
        Dictionary<int, int> nextGreaterOf = new Dictionary<int, int>();
        Stack<int> stack = new Stack<int>();
        foreach (int num in nums2) {
            while (stack.Count > 0 && num > stack.Peek()) {
                nextGreaterOf[stack.Pop()] = num;
            }
            stack.Push(num);
        }

        int[] answer = new int[nums1.Length];
        for (int i = 0; i < nums1.Length; i++) {
            if (nextGreaterOf.ContainsKey(nums1[i])) {
                answer[i] = nextGreaterOf[nums1[i]];
            } else {
                answer[i] = -1;
            }
        }
        return answer;
    }
}
