// need[c] 表示視窗還欠幾個 c（負數代表有多的），missingKinds 是還沒湊齊的字母種類數。
// 右端點每進一個字母就把它的 need 減一，剛好減到 0 代表這種字母湊齊了，missingKinds 減一。
// missingKinds 變成 0 時視窗已涵蓋 t：先用它更新最短答案，再移出左端點的字母縮小視窗；
// 移出的字母如果原本 need 剛好是 0，移出後就不夠了，missingKinds 加一，停止縮小。
// 每個字母最多進出視窗各一次，時間 O(m + n)，空間 O(字元集大小)。
public class Solution {
    public string MinWindow(string s, string t) {
        int[] need = new int[128];
        int missingKinds = 0;
        foreach (char c in t) {
            if (need[c] == 0) {
                missingKinds++;
            }
            need[c]++;
        }

        int bestLeft = -1;
        int bestRight = s.Length;
        int left = 0;
        for (int right = 0; right < s.Length; right++) {
            char c = s[right];
            need[c]--;
            if (need[c] == 0) {
                missingKinds--;
            }
            while (missingKinds == 0) {
                if (right - left < bestRight - bestLeft) {
                    bestLeft = left;
                    bestRight = right;
                }
                char outChar = s[left];
                if (need[outChar] == 0) {
                    missingKinds++;
                }
                need[outChar]++;
                left++;
            }
        }
        if (bestLeft < 0) {
            return "";
        }
        return s.Substring(bestLeft, bestRight - bestLeft + 1);
    }
}
