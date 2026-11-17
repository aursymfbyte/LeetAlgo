// 用雜湊表記錄每道食物目前的評分和所屬料理，再替每種料理準備一個堆，
// 堆頂是「評分最高、評分相同時名稱字典序最小」的那道食物。
// 改評分時不去堆裡找舊紀錄，而是直接推一筆新的 (新評分, 食物)，舊紀錄留在堆裡變成過期資料（懶刪除）。
// 查詢時看堆頂：如果它記的評分和這道食物目前的評分不同，就是過期的，彈掉再看下一個，直到堆頂有效。
// 建構 O(n log n)，changeRating O(log(n + q))，highestRated 均攤 O(log(n + q))，q 是改評分次數；空間 O(n + q)。
public class FoodRatings {
    private static readonly IComparer<(int Rating, string Food)> HigherFirst =
        Comparer<(int Rating, string Food)>.Create((a, b) => {
            if (a.Rating != b.Rating) {
                return b.Rating.CompareTo(a.Rating);
            }
            return string.CompareOrdinal(a.Food, b.Food);
        });

    private Dictionary<string, int> ratingOf;
    private Dictionary<string, string> cuisineOf;
    private Dictionary<string, PriorityQueue<(int Rating, string Food), (int Rating, string Food)>> heaps;

    public FoodRatings(string[] foods, string[] cuisines, int[] ratings) {
        ratingOf = new Dictionary<string, int>();
        cuisineOf = new Dictionary<string, string>();
        heaps = new Dictionary<string, PriorityQueue<(int Rating, string Food), (int Rating, string Food)>>();
        for (int i = 0; i < foods.Length; i++) {
            ratingOf[foods[i]] = ratings[i];
            cuisineOf[foods[i]] = cuisines[i];
            if (!heaps.ContainsKey(cuisines[i])) {
                heaps[cuisines[i]] = new PriorityQueue<(int Rating, string Food), (int Rating, string Food)>(HigherFirst);
            }
            heaps[cuisines[i]].Enqueue((ratings[i], foods[i]), (ratings[i], foods[i]));
        }
    }

    public void ChangeRating(string food, int newRating) {
        ratingOf[food] = newRating;
        heaps[cuisineOf[food]].Enqueue((newRating, food), (newRating, food));
    }

    public string HighestRated(string cuisine) {
        PriorityQueue<(int Rating, string Food), (int Rating, string Food)> heap = heaps[cuisine];
        while (heap.Peek().Rating != ratingOf[heap.Peek().Food]) {
            heap.Dequeue();
        }
        return heap.Peek().Food;
    }
}
