// 把 potions 由小到大排序後，對同一個咒語 spell，乘積 >= success 的藥水會是排序後的一段後綴。
// 對每個咒語用開區間 (left, right) 二分，找第一個 spell * potions[mid] >= success 的位置 index，
// 成功的藥水數就是 m - index。
// 時間 O((n + m) log m)；不算排序和回傳陣列，空間 O(1)。
public class Solution {
    public int[] SuccessfulPairs(int[] spells, int[] potions, long success) {
        Array.Sort(potions);
        int m = potions.Length;
        int[] pairs = new int[spells.Length];
        for (int i = 0; i < spells.Length; i++) {
            int index = FirstSuccessIndex(potions, spells[i], success);
            pairs[i] = m - index;
        }
        return pairs;
    }

    private int FirstSuccessIndex(int[] potions, int spell, long success) {
        int left = -1;
        int right = potions.Length;
        while (left + 1 < right) {
            int mid = left + (right - left) / 2;
            if ((long)spell * potions[mid] >= success) {
                right = mid;
            } else {
                left = mid;
            }
        }
        return right;
    }
}
