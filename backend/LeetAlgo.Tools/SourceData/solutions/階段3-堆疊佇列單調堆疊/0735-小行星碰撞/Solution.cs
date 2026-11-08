// 由左往右處理，堆疊裡放目前還活著的小行星。
// 只有「堆疊頂端往右飛（正）、新的往左飛（負）」才會相撞：
// 頂端比較小就爆掉、繼續跟下一個比；一樣大就同歸於盡；頂端比較大就是新的爆掉。
// 新的小行星撐到最後沒爆，才放進堆疊。
// 每顆小行星最多進出堆疊一次，時間 O(n)，空間 O(n)。
public class Solution {
    public int[] AsteroidCollision(int[] asteroids) {
        List<int> stack = new List<int>();
        foreach (int asteroid in asteroids) {
            bool alive = true;
            while (alive && asteroid < 0 && stack.Count > 0 && stack[stack.Count - 1] > 0) {
                int top = stack[stack.Count - 1];
                if (top < -asteroid) {
                    stack.RemoveAt(stack.Count - 1);
                } else if (top == -asteroid) {
                    stack.RemoveAt(stack.Count - 1);
                    alive = false;
                } else {
                    alive = false;
                }
            }
            if (alive) {
                stack.Add(asteroid);
            }
        }
        return stack.ToArray();
    }
}
