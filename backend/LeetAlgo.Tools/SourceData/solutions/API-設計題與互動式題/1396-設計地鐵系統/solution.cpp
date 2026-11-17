// 用兩個雜湊表：
// checkIns 記錄還在車上的乘客：id -> (進站站名, 進站時間)；
// routes 記錄每條路線的統計：「起點->終點」字串 -> (總花費時間, 趟數)。
// 出站時從 checkIns 取出這位乘客的進站資料，把這趟時間累加到對應路線，再把乘客移除。
// 平均時間就是總時間除以趟數；總時間可能超過 int 範圍，用 long long 存。
// 每個操作 O(1)（不計字串長度），空間 O(乘客數 + 路線數)。
class UndergroundSystem {
private:
    unordered_map<int, pair<string, int>> checkIns;
    unordered_map<string, pair<long long, int>> routes;

public:
    UndergroundSystem() {
    }

    void checkIn(int id, string stationName, int t) {
        checkIns[id] = {stationName, t};
    }

    void checkOut(int id, string stationName, int t) {
        string startStation = checkIns[id].first;
        int startTime = checkIns[id].second;
        checkIns.erase(id);

        string route = startStation + "->" + stationName;
        routes[route].first += t - startTime;
        routes[route].second++;
    }

    double getAverageTime(string startStation, string endStation) {
        string route = startStation + "->" + endStation;
        return (double)routes[route].first / routes[route].second;
    }
};
