// f 對 x、y 都嚴格遞增。x 從 1 往上、y 從 1000 往下做相向雙指針：
// f(x, y) < z 時，目前的 y 已經是剩下最大的，這個 x 再怎麼配都不夠大，x 加一；
// f(x, y) > z 時，目前的 x 已經是剩下最小的，這個 y 再怎麼配都太大，y 減一；
// 相等就記錄答案，因為同一個 x 只會對應一個 y，x 加一、y 減一。
// x 和 y 各最多移動 1000 次，時間 O(2000)；額外空間 O(1)（不計答案）。
public class Solution {
    public IList<IList<int>> FindSolution(CustomFunction customfunction, int z) {
        IList<IList<int>> answer = new List<IList<int>>();
        int x = 1;
        int y = 1000;
        while (x <= 1000 && y >= 1) {
            int value = customfunction.f(x, y);
            if (value < z) {
                x++;
            } else if (value > z) {
                y--;
            } else {
                answer.Add(new List<int> { x, y });
                x++;
                y--;
            }
        }
        return answer;
    }
}
