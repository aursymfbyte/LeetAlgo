# 每一列剛好放一個皇后，所以問題變成：第 row 列的皇后要放在哪一行（排列型回溯）。
# 判重用三個陣列：同一行用 col_used[col]；
# 「/」方向的斜線上 row + col 相同，用 slash_used[row + col]；
# 「\」方向的斜線上 row - col 相同，加上 n - 1 變成非負下標，用 backslash_used[row - col + n - 1]。
# 放下去之前三者都沒被佔才能放，遞迴回來後再把標記清掉（恢復現場）。
# 時間 O(n^2·n!)，空間 O(n)（不計答案）。
class Solution:
    def solveNQueens(self, n: int) -> list[list[str]]:
        answer = []
        queen_cols = [0] * n
        col_used = [False] * n
        slash_used = [False] * (2 * n - 1)
        backslash_used = [False] * (2 * n - 1)

        def dfs(row: int) -> None:
            if row == n:
                board = []
                for col in queen_cols:
                    board.append("." * col + "Q" + "." * (n - 1 - col))
                answer.append(board)
                return
            for col in range(n):
                if not col_used[col] and not slash_used[row + col] and not backslash_used[row - col + n - 1]:
                    queen_cols[row] = col
                    col_used[col] = True
                    slash_used[row + col] = True
                    backslash_used[row - col + n - 1] = True
                    dfs(row + 1)
                    col_used[col] = False
                    slash_used[row + col] = False
                    backslash_used[row - col + n - 1] = False

        dfs(0)
        return answer
