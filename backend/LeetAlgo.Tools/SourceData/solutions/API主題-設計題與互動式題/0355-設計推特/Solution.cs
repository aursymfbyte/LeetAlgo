// 用一個全域遞增的 time 當發文時間。每位使用者的推文依序放在自己的陣列尾端，越後面越新；
// 另外用雜湊表記錄每個人追蹤了誰。
// 動態消息要從「自己 + 追蹤的人」這 k 個各自有序的推文串列裡，挑出最新的 10 則，就是合併 k 個有序串列：
// 先把每個人最新的一則放進最大堆，每次彈出最新的那則，再把同一個人的前一則推文放進堆，直到拿滿 10 則或堆空了。
// postTweet / follow / unfollow O(1)，getNewsFeed O(k log k)；空間 O(推文數 + 追蹤關係數)。
public class Twitter {
    private int time;
    private Dictionary<int, List<(int Time, int TweetId)>> tweets;
    private Dictionary<int, HashSet<int>> following;

    public Twitter() {
        time = 0;
        tweets = new Dictionary<int, List<(int Time, int TweetId)>>();
        following = new Dictionary<int, HashSet<int>>();
    }

    public void PostTweet(int userId, int tweetId) {
        if (!tweets.ContainsKey(userId)) {
            tweets[userId] = new List<(int Time, int TweetId)>();
        }
        tweets[userId].Add((time, tweetId));
        time++;
    }

    public IList<int> GetNewsFeed(int userId) {
        HashSet<int> users = new HashSet<int>();
        users.Add(userId);
        if (following.ContainsKey(userId)) {
            users.UnionWith(following[userId]);
        }

        PriorityQueue<(int User, int Index), int> heap = new PriorityQueue<(int User, int Index), int>();
        foreach (int user in users) {
            if (tweets.ContainsKey(user)) {
                int lastIndex = tweets[user].Count - 1;
                heap.Enqueue((user, lastIndex), -tweets[user][lastIndex].Time);
            }
        }

        List<int> feed = new List<int>();
        while (heap.Count > 0 && feed.Count < 10) {
            (int user, int index) = heap.Dequeue();
            feed.Add(tweets[user][index].TweetId);
            if (index > 0) {
                heap.Enqueue((user, index - 1), -tweets[user][index - 1].Time);
            }
        }
        return feed;
    }

    public void Follow(int followerId, int followeeId) {
        if (!following.ContainsKey(followerId)) {
            following[followerId] = new HashSet<int>();
        }
        following[followerId].Add(followeeId);
    }

    public void Unfollow(int followerId, int followeeId) {
        if (following.ContainsKey(followerId)) {
            following[followerId].Remove(followeeId);
        }
    }
}
