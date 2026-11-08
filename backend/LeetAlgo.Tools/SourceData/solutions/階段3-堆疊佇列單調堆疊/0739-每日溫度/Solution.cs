// 單調堆疊：堆疊裡放「還沒等到更暖天氣」的日子下標，由底到頂溫度遞減。
// 走到第 i 天時，只要今天比堆疊頂端那天熱，那天的答案就是 i - 那天，把它彈出；
// 彈完之後再把今天放進堆疊。最後還留在堆疊裡的日子都等不到，答案維持 0。
// 每個下標最多進出堆疊一次，時間 O(n)，空間 O(n)。
public class Solution {
    public int[] DailyTemperatures(int[] temperatures) {
        int n = temperatures.Length;
        int[] answer = new int[n];
        Stack<int> stack = new Stack<int>();
        for (int i = 0; i < n; i++) {
            while (stack.Count > 0 && temperatures[i] > temperatures[stack.Peek()]) {
                int previousDay = stack.Pop();
                answer[previousDay] = i - previousDay;
            }
            stack.Push(i);
        }
        return answer;
    }
}
