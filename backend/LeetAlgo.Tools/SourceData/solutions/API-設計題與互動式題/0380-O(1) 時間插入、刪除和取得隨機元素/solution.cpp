// 用陣列 values 存所有元素，讓 getRandom 可以隨機挑一個下標；
// 再用雜湊表 indexOf 記錄每個值在陣列裡的下標，讓 insert / remove 能 O(1) 找到位置。
// 刪除時把陣列最後一個元素搬到被刪的位置、更新它的下標，再刪掉陣列尾端，就不用整段移動。
// 要先更新搬過去那個元素的下標，再從雜湊表刪掉 val，這樣刪的剛好是尾端元素時也正確。
// 每個操作平均 O(1)，空間 O(n)。
class RandomizedSet {
private:
    vector<int> values;
    unordered_map<int, int> indexOf;

public:
    RandomizedSet() {
    }

    bool insert(int val) {
        if (indexOf.count(val) > 0) {
            return false;
        }
        indexOf[val] = values.size();
        values.push_back(val);
        return true;
    }

    bool remove(int val) {
        if (indexOf.count(val) == 0) {
            return false;
        }
        int index = indexOf[val];
        int lastValue = values.back();
        values[index] = lastValue;
        indexOf[lastValue] = index;
        values.pop_back();
        indexOf.erase(val);
        return true;
    }

    int getRandom() {
        return values[rand() % values.size()];
    }
};
