// 用兩個雜湊表：
// checkIns 記錄還在車上的乘客：id -> (進站站名, 進站時間)；
// routes 記錄每條路線的統計：(起點, 終點) -> (總花費時間, 趟數)。
// 出站時從 checkIns 取出這位乘客的進站資料，把這趟時間累加到對應路線，再把乘客移除。
// 平均時間就是總時間除以趟數；總時間可能超過 int 範圍，用 long 存。
// 每個操作 O(1)（不計字串長度），空間 O(乘客數 + 路線數)。
public class UndergroundSystem {
    private Dictionary<int, (string Station, int Time)> checkIns;
    private Dictionary<(string Start, string End), (long TotalTime, int TripCount)> routes;

    public UndergroundSystem() {
        checkIns = new Dictionary<int, (string Station, int Time)>();
        routes = new Dictionary<(string Start, string End), (long TotalTime, int TripCount)>();
    }

    public void CheckIn(int id, string stationName, int t) {
        checkIns[id] = (stationName, t);
    }

    public void CheckOut(int id, string stationName, int t) {
        (string startStation, int startTime) = checkIns[id];
        checkIns.Remove(id);

        (string, string) route = (startStation, stationName);
        if (!routes.ContainsKey(route)) {
            routes[route] = (0, 0);
        }
        (long totalTime, int tripCount) = routes[route];
        routes[route] = (totalTime + t - startTime, tripCount + 1);
    }

    public double GetAverageTime(string startStation, string endStation) {
        (long totalTime, int tripCount) = routes[(startStation, endStation)];
        return (double)totalTime / tripCount;
    }
}
