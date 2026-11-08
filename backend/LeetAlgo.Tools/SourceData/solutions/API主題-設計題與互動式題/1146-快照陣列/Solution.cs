// 不真的複製整個陣列，而是讓每一格記錄自己的修改歷史：一串 (snapId, val)，snapId 是修改當下的快照編號。
// set 時，如果這一格最後一筆紀錄的 snapId 就是目前編號，直接覆蓋；否則在尾端新增一筆。
// snap 只要把目前編號加一，並回傳加一前的編號。
// get(index, snap_id) 要找這一格「snapId <= 查詢編號」的最後一筆紀錄：
// 二分搜尋第一個 snapId 大於查詢編號的位置，前一格就是答案；沒有前一格代表從沒改過，值是 0。
// set 均攤 O(1)、snap O(1)，get O(log k)，k 是這一格的紀錄數；空間 O(length + set 的呼叫次數)。
public class SnapshotArray {
    private List<(int SnapId, int Value)>[] history;
    private int currentSnapId;

    public SnapshotArray(int length) {
        history = new List<(int SnapId, int Value)>[length];
        for (int i = 0; i < length; i++) {
            history[i] = new List<(int SnapId, int Value)>();
        }
        currentSnapId = 0;
    }

    public void Set(int index, int val) {
        List<(int SnapId, int Value)> records = history[index];
        if (records.Count > 0 && records[records.Count - 1].SnapId == currentSnapId) {
            records[records.Count - 1] = (currentSnapId, val);
        } else {
            records.Add((currentSnapId, val));
        }
    }

    public int Snap() {
        currentSnapId++;
        return currentSnapId - 1;
    }

    public int Get(int index, int snap_id) {
        List<(int SnapId, int Value)> records = history[index];
        int left = 0;
        int right = records.Count;
        while (left < right) {
            int mid = (left + right) / 2;
            if (records[mid].SnapId <= snap_id) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        if (left == 0) {
            return 0;
        }
        return records[left - 1].Value;
    }
}
