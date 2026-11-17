// 用雜湊表記錄每道食物目前的評分和所屬料理，再替每種料理準備一個堆，
// 堆頂是「評分最高、評分相同時名稱字典序最小」的那道食物。
// 改評分時不去堆裡找舊紀錄，而是直接推一筆新的 (新評分, 食物)，舊紀錄留在堆裡變成過期資料（懶刪除）。
// 查詢時看堆頂：如果它記的評分和這道食物目前的評分不同，就是過期的，彈掉再看下一個，直到堆頂有效。
// 堆裡存 (-評分, 名稱) 的最小堆，評分高的排前面，評分相同時名稱小的排前面。
// 建構 O(n log n)，changeRating O(log(n + q))，highestRated 均攤 O(log(n + q))，q 是改評分次數；空間 O(n + q)。
class FoodRatings {
private:
    unordered_map<string, int> ratingOf;
    unordered_map<string, string> cuisineOf;
    unordered_map<string, priority_queue<pair<int, string>, vector<pair<int, string>>, greater<pair<int, string>>>> heaps;

public:
    FoodRatings(vector<string>& foods, vector<string>& cuisines, vector<int>& ratings) {
        int n = foods.size();
        for (int i = 0; i < n; i++) {
            ratingOf[foods[i]] = ratings[i];
            cuisineOf[foods[i]] = cuisines[i];
            heaps[cuisines[i]].push({-ratings[i], foods[i]});
        }
    }

    void changeRating(string food, int newRating) {
        ratingOf[food] = newRating;
        heaps[cuisineOf[food]].push({-newRating, food});
    }

    string highestRated(string cuisine) {
        auto& heap = heaps[cuisine];
        while (-heap.top().first != ratingOf[heap.top().second]) {
            heap.pop();
        }
        return heap.top().second;
    }
};
