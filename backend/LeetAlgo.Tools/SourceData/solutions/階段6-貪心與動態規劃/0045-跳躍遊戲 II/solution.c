// 「造橋」的想法：currentEnd 是目前這座橋（已用的跳躍次數）能走到的最遠位置，
// nextEnd 是在橋上任何一點起跳後、下一座橋最遠能蓋到哪裡。
// 一邊走一邊用 i + nums[i] 更新 nextEnd；走到橋尾（i == currentEnd）時才不得不再跳一次，
// 這時跳躍次數加一，並把橋延伸到 nextEnd。
// 只走到 n - 2：抵達最後一格就不用再跳，否則當 currentEnd 剛好在 n - 1 時會多算一次。
// 時間 O(n)，空間 O(1)。
int jump(int* nums, int numsSize) {
    int answer = 0;
    int currentEnd = 0;
    int nextEnd = 0;
    for (int i = 0; i < numsSize - 1; i++) {
        if (i + nums[i] > nextEnd) {
            nextEnd = i + nums[i];
        }
        if (i == currentEnd) {
            answer++;
            currentEnd = nextEnd;
        }
    }
    return answer;
}
