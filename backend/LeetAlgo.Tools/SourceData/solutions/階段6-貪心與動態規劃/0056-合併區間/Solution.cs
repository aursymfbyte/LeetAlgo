// 按左端點排序後，可以和目前區間重疊的區間一定緊接在它後面。
// 依序處理每個區間：如果它的左端點 ≤ 答案中最後一個區間的右端點，就重疊（端點相接也算），
// 把最後一個區間的右端點更新成兩者較大的那個；否則它和前面都不重疊，直接當成新區間加入答案。
// 時間 O(n log n)，空間 O(log n)（排序用，不計答案）。
public class Solution {
    public int[][] Merge(int[][] intervals) {
        Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
        List<int[]> merged = new List<int[]>();
        foreach (int[] interval in intervals) {
            if (merged.Count > 0 && interval[0] <= merged[merged.Count - 1][1]) {
                int[] last = merged[merged.Count - 1];
                last[1] = Math.Max(last[1], interval[1]);
            } else {
                merged.Add(new int[] { interval[0], interval[1] });
            }
        }
        return merged.ToArray();
    }
}
