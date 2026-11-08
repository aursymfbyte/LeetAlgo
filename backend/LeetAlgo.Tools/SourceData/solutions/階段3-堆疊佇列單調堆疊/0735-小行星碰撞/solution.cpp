// 由左往右處理，堆疊裡放目前還活著的小行星。
// 只有「堆疊頂端往右飛（正）、新的往左飛（負）」才會相撞：
// 頂端比較小就爆掉、繼續跟下一個比；一樣大就同歸於盡；頂端比較大就是新的爆掉。
// 新的小行星撐到最後沒爆，才放進堆疊。
// 每顆小行星最多進出堆疊一次，時間 O(n)，空間 O(n)。
class Solution {
public:
    vector<int> asteroidCollision(vector<int>& asteroids) {
        vector<int> st;
        for (int asteroid : asteroids) {
            bool alive = true;
            while (alive && asteroid < 0 && !st.empty() && st.back() > 0) {
                if (st.back() < -asteroid) {
                    st.pop_back();
                } else if (st.back() == -asteroid) {
                    st.pop_back();
                    alive = false;
                } else {
                    alive = false;
                }
            }
            if (alive) {
                st.push_back(asteroid);
            }
        }
        return st;
    }
};
