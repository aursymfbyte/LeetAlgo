// 用陣列 values 存所有元素，讓 getRandom 可以隨機挑一個下標；
// 再用雜湊表 indexOf 記錄每個值在陣列裡的下標，讓 insert / remove 能 O(1) 找到位置。
// 刪除時把陣列最後一個元素搬到被刪的位置、更新它的下標，再刪掉陣列尾端，就不用整段移動。
// 要先更新搬過去那個元素的下標，再從雜湊表刪掉 val，這樣刪的剛好是尾端元素時也正確。
// 每個操作平均 O(1)，空間 O(n)。
public class RandomizedSet {
    private List<int> values;
    private Dictionary<int, int> indexOf;
    private Random random;

    public RandomizedSet() {
        values = new List<int>();
        indexOf = new Dictionary<int, int>();
        random = new Random();
    }

    public bool Insert(int val) {
        if (indexOf.ContainsKey(val)) {
            return false;
        }
        indexOf[val] = values.Count;
        values.Add(val);
        return true;
    }

    public bool Remove(int val) {
        if (!indexOf.ContainsKey(val)) {
            return false;
        }
        int index = indexOf[val];
        int lastValue = values[values.Count - 1];
        values[index] = lastValue;
        indexOf[lastValue] = index;
        values.RemoveAt(values.Count - 1);
        indexOf.Remove(val);
        return true;
    }

    public int GetRandom() {
        return values[random.Next(values.Count)];
    }
}
