// Manacher 演算法。先在每個字元的前後插入 '#'，例如 "aba" 變成 "#a#b#a#"，
// 這樣不論原本的回文長度是奇數還是偶數，在新字串裡都會變成以某個位置為中心的奇數長度回文。
// radius[i] 表示在新字串中以 i 為中心，往左右各能延伸幾個字元仍然是回文；
// 換算回原字串，這段回文的長度剛好是 radius[i]，起點是 (i - radius[i]) / 2。
// 從左到右計算 radius，同時記錄目前「右端點最遠」的回文：中心是 center，右端點是 rightBoundary。
// 如果 i 在 rightBoundary 之內，i 對於 center 的鏡像位置 mirror = 2 * center - i 已經算過，
// 因為大回文左右對稱，i 附近的樣子和 mirror 附近一樣，所以 radius[i] 至少是
// min(radius[mirror], rightBoundary - i)，可以直接從這個長度開始，不用從 0 重新比對。
// 接著再一個一個字元往外擴；如果擴出了 rightBoundary，就把 center 和 rightBoundary 更新成 i 這段。
// rightBoundary 只會往右移、不會往回，所以往外擴的總次數是 O(n)。
// 時間 O(n)，空間 O(n)。
class Solution {
public:
    string longestPalindrome(string s) {
        int n = s.size();
        int m = 2 * n + 1;
        string transformed(m, '#');
        for (int i = 0; i < n; i++) {
            transformed[2 * i + 1] = s[i];
        }

        vector<int> radius(m, 0);
        int center = 0;
        int rightBoundary = 0;
        int bestStart = 0;
        int bestLength = 0;
        for (int i = 0; i < m; i++) {
            int currentRadius = 0;
            if (i < rightBoundary) {
                int mirror = 2 * center - i;
                currentRadius = min(radius[mirror], rightBoundary - i);
            }
            while (i - currentRadius - 1 >= 0 && i + currentRadius + 1 < m
                   && transformed[i - currentRadius - 1] == transformed[i + currentRadius + 1]) {
                currentRadius++;
            }
            radius[i] = currentRadius;
            if (i + currentRadius > rightBoundary) {
                center = i;
                rightBoundary = i + currentRadius;
            }
            if (currentRadius > bestLength) {
                bestLength = currentRadius;
                bestStart = (i - currentRadius) / 2;
            }
        }
        return s.substr(bestStart, bestLength);
    }
};
