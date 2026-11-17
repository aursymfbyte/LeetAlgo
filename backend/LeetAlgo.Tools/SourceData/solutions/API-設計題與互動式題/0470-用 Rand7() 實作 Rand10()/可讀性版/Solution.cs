// 拒絕取樣：呼叫兩次 Rand7()，把 (第一次 - 1) * 7 + 第二次 看成 1 到 49 的均勻整數。
// 只接受 1 到 40，這 40 個數平均分成 10 組，(value - 1) % 10 + 1 就是均勻的 1 到 10；
// 抽到 41 到 49 就整組重抽，才不會讓某些結果機率偏高。
// 每輪成功機率 40/49，期望呼叫 Rand7() 約 2 * 49 / 40 ≈ 2.45 次；空間 O(1)。
public class Solution : SolBase {
    public int Rand10() {
        while (true) {
            int value = (Rand7() - 1) * 7 + Rand7();
            if (value <= 40) {
                return (value - 1) % 10 + 1;
            }
        }
    }
}
