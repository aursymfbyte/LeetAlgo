# 以每個格子當起點做回溯：dfs(row, col, index) 判斷從 (row, col) 出發能不能拼出 word[index:]。
# 目前格子的字母不等於 word[index] 就失敗；index 已經是最後一個字母就成功。
# 往下走之前把目前格子暫時改成 "#"，避免同一格被用兩次；四個方向都試完後再改回原本的字母（恢復現場）。
# 時間 O(m·n·3^L)，L 是 word 的長度（除了來的方向，每步最多再往 3 個方向走）；空間 O(L)。
DIRECTIONS = [(1, 0), (-1, 0), (0, 1), (0, -1)]


class Solution:
    def exist(self, board: list[list[str]], word: str) -> bool:
        rows = len(board)
        cols = len(board[0])

        def dfs(row: int, col: int, index: int) -> bool:
            if board[row][col] != word[index]:
                return False
            if index == len(word) - 1:
                return True

            board[row][col] = "#"
            found = False
            for row_step, col_step in DIRECTIONS:
                next_row = row + row_step
                next_col = col + col_step
                if 0 <= next_row < rows and 0 <= next_col < cols and dfs(next_row, next_col, index + 1):
                    found = True
                    break
            board[row][col] = word[index]
            return found

        for row in range(rows):
            for col in range(cols):
                if dfs(row, col, 0):
                    return True
        return False
