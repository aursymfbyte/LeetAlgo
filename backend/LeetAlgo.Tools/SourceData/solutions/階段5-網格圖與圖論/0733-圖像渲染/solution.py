# 從起點出發做 DFS，把和起點原本顏色相同、而且上下左右相連的格子都改成新顏色。
# 如果起點原本的顏色就等於新顏色，直接回傳，否則改過的格子分不出來，會無限遞迴。
# 時間 O(m * n)，空間 O(m * n)（遞迴深度最壞是整張圖）。
class Solution:
    def floodFill(self, image: list[list[int]], sr: int, sc: int, color: int) -> list[list[int]]:
        original = image[sr][sc]
        if original == color:
            return image

        rows = len(image)
        cols = len(image[0])
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        def fill(row: int, col: int) -> None:
            if row < 0 or row >= rows or col < 0 or col >= cols:
                return
            if image[row][col] != original:
                return
            image[row][col] = color
            for row_step, col_step in directions:
                fill(row + row_step, col + col_step)

        fill(sr, sc)
        return image
