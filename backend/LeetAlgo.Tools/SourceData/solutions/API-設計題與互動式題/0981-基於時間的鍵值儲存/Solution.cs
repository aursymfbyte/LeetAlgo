// 用雜湊表把每個 key 對應到兩個陣列：timestamps 和 values，依照 set 的順序加在尾端。
// 題目保證 set 的時間戳嚴格遞增，所以 timestamps 本身就是排好序的，不用另外排序。
// get 時二分搜尋「第一個大於 timestamp 的位置」，它的前一格就是時間戳 <= timestamp 中最大的那筆；
// 前一格不存在（位置是 0）就回傳空字串。
// set 均攤 O(1)，get O(log n)，空間 O(set 的呼叫次數)。
public class TimeMap {
    private Dictionary<string, List<int>> timestamps;
    private Dictionary<string, List<string>> values;

    public TimeMap() {
        timestamps = new Dictionary<string, List<int>>();
        values = new Dictionary<string, List<string>>();
    }

    public void Set(string key, string value, int timestamp) {
        if (!timestamps.ContainsKey(key)) {
            timestamps[key] = new List<int>();
            values[key] = new List<string>();
        }
        timestamps[key].Add(timestamp);
        values[key].Add(value);
    }

    public string Get(string key, int timestamp) {
        if (!timestamps.ContainsKey(key)) {
            return "";
        }
        List<int> times = timestamps[key];
        int left = 0;
        int right = times.Count;
        while (left < right) {
            int mid = (left + right) / 2;
            if (times[mid] <= timestamp) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        if (left == 0) {
            return "";
        }
        return values[key][left - 1];
    }
}
