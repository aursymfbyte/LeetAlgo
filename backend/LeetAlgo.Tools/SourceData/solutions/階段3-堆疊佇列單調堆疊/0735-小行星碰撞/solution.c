// 由左往右處理，堆疊裡放目前還活著的小行星。
// 只有「堆疊頂端往右飛（正）、新的往左飛（負）」才會相撞：
// 頂端比較小就爆掉、繼續跟下一個比；一樣大就同歸於盡；頂端比較大就是新的爆掉。
// 新的小行星撐到最後沒爆，才放進堆疊。
// 每顆小行星最多進出堆疊一次，時間 O(n)，空間 O(n)。
int* asteroidCollision(int* asteroids, int asteroidsSize, int* returnSize) {
    int* stack = malloc(sizeof(int) * asteroidsSize);
    int top = 0;

    for (int i = 0; i < asteroidsSize; i++) {
        int asteroid = asteroids[i];
        bool alive = true;
        while (alive && asteroid < 0 && top > 0 && stack[top - 1] > 0) {
            if (stack[top - 1] < -asteroid) {
                top--;
            } else if (stack[top - 1] == -asteroid) {
                top--;
                alive = false;
            } else {
                alive = false;
            }
        }
        if (alive) {
            stack[top] = asteroid;
            top++;
        }
    }

    *returnSize = top;
    return stack;
}
