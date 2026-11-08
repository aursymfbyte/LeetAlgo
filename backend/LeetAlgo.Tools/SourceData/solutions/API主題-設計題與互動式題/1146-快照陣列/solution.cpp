// 不真的複製整個陣列，而是讓每一格記錄自己的修改歷史：一串 (snapId, value)，snapId 是修改當下的快照編號。
// set 時，如果這一格最後一筆紀錄的 snapId 就是目前編號，直接覆蓋；否則在尾端新增一筆。
// snap 只要把目前編號加一，並回傳加一前的編號。
// get(index, snap_id) 要找這一格「snapId <= 查詢編號」的最後一筆紀錄：
// 二分搜尋第一個 snapId 大於查詢編號的位置，前一格就是答案；沒有前一格代表從沒改過，值是 0。
// set 均攤 O(1)、snap O(1)，get O(log k)，k 是這一格的紀錄數；空間 O(length + set 的呼叫次數)。
class SnapshotArray {
private:
    vector<vector<pair<int, int>>> history;
    int currentSnapId;

public:
    SnapshotArray(int length) {
        history.resize(length);
        currentSnapId = 0;
    }

    void set(int index, int val) {
        vector<pair<int, int>>& records = history[index];
        if (!records.empty() && records.back().first == currentSnapId) {
            records.back().second = val;
        } else {
            records.push_back({currentSnapId, val});
        }
    }

    int snap() {
        currentSnapId++;
        return currentSnapId - 1;
    }

    int get(int index, int snap_id) {
        vector<pair<int, int>>& records = history[index];
        int left = 0;
        int right = records.size();
        while (left < right) {
            int mid = (left + right) / 2;
            if (records[mid].first <= snap_id) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        if (left == 0) {
            return 0;
        }
        return records[left - 1].second;
    }
};
