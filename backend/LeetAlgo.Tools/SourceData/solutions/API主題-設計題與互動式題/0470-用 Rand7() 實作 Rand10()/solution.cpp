// 拒絕取樣，並重複利用被拒絕時剩下的亂數。
// 先用 (rand7() - 1) * 7 + rand7() 得到均勻的 1 到 49，落在 1 到 40 就回傳 (value - 1) % 10 + 1。
// 落在 41 到 49 時，value - 40 是均勻的 1 到 9，再配一次 rand7() 得到均勻的 1 到 63，落在 1 到 60 就回傳。
// 落在 61 到 63 時，value - 60 是均勻的 1 到 3，再配一次 rand7() 得到均勻的 1 到 21，落在 1 到 20 就回傳；否則整輪重來。
// 期望呼叫 rand7() 約 2.19 次，時間期望 O(1)，空間 O(1)。
class Solution {
public:
    int rand10() {
        while (true) {
            int value49 = (rand7() - 1) * 7 + rand7();
            if (value49 <= 40) {
                return (value49 - 1) % 10 + 1;
            }

            int value63 = (value49 - 40 - 1) * 7 + rand7();
            if (value63 <= 60) {
                return (value63 - 1) % 10 + 1;
            }

            int value21 = (value63 - 60 - 1) * 7 + rand7();
            if (value21 <= 20) {
                return (value21 - 1) % 10 + 1;
            }
        }
    }
};
