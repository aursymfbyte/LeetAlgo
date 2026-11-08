# 正難則反：直接判斷一塊 'O' 有沒有被包圍很麻煩，反過來想，只有連到邊界的 'O' 才不會被包圍。
# 先從四條邊上的每個 'O' 出發做 DFS，把連得到的 'O' 暫時標成 '#'（代表安全）。
# 最後掃一遍：剩下的 'O' 都是被包圍的，改成 'X'；'#' 還原成 'O'。
# 時間 O(m * n)，空間 O(m * n)（遞迴深度最壞是整張圖）。
class Solution:
    def solve(self, board: list[list[str]]) -> None:
        rows = len(board)
        cols = len(board[0])
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        def mark_safe(row: int, col: int) -> None:
            if row < 0 or row >= rows or col < 0 or col >= cols:
                return
            if board[row][col] != "O":
                return
            board[row][col] = "#"
            for row_step, col_step in directions:
                mark_safe(row + row_step, col + col_step)

        for row in range(rows):
            mark_safe(row, 0)
            mark_safe(row, cols - 1)
        for col in range(cols):
            mark_safe(0, col)
            mark_safe(rows - 1, col)

        for row in range(rows):
            for col in range(cols):
                if board[row][col] == "O":
                    board[row][col] = "X"
                elif board[row][col] == "#":
                    board[row][col] = "O"
