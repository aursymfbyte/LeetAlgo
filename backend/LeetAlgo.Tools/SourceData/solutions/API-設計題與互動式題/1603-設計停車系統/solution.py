# 用一個長度 4 的陣列記錄每種車位還剩幾格，下標直接對應 carType（1 大、2 中、3 小）。
# 停車時看該種車位還有沒有剩，有就減一並回傳 true。
# 每次操作 O(1)，空間 O(1)。
class ParkingSystem:

    def __init__(self, big: int, medium: int, small: int):
        self.remaining = [0, big, medium, small]

    def addCar(self, carType: int) -> bool:
        if self.remaining[carType] == 0:
            return False
        self.remaining[carType] -= 1
        return True
