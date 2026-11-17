# 用兩個雜湊表：
# check_ins 記錄還在車上的乘客：id -> (進站站名, 進站時間)；
# routes 記錄每條路線的統計：(起點, 終點) -> [總花費時間, 趟數]。
# 出站時從 check_ins 取出這位乘客的進站資料，把這趟時間累加到對應路線，再把乘客移除。
# 平均時間就是總時間除以趟數。
# 每個操作 O(1)（不計字串長度），空間 O(乘客數 + 路線數)。
class UndergroundSystem:

    def __init__(self):
        self.check_ins = {}
        self.routes = {}

    def checkIn(self, id: int, stationName: str, t: int) -> None:
        self.check_ins[id] = (stationName, t)

    def checkOut(self, id: int, stationName: str, t: int) -> None:
        start_station, start_time = self.check_ins.pop(id)
        route = (start_station, stationName)
        if route not in self.routes:
            self.routes[route] = [0, 0]
        self.routes[route][0] += t - start_time
        self.routes[route][1] += 1

    def getAverageTime(self, startStation: str, endStation: str) -> float:
        total_time, trip_count = self.routes[(startStation, endStation)]
        return total_time / trip_count
