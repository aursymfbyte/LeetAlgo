// 用 write 指向下一個要放非零數的位置，把非零數依序往前覆寫，最後把剩下的位置補 0。
// 時間 O(n)，空間 O(1)。
void moveZeroes(int* nums, int numsSize) {
    int write = 0;
    for (int i = 0; i < numsSize; i++) {
        if (nums[i] != 0) {
            nums[write] = nums[i];
            write++;
        }
    }

    for (int i = write; i < numsSize; i++) {
        nums[i] = 0;
    }
}
