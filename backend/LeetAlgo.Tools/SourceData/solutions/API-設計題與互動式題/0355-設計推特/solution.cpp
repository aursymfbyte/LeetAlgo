// 用一個全域遞增的 time 當發文時間。每位使用者的推文依序放在自己的陣列尾端，越後面越新；
// 另外用雜湊表記錄每個人追蹤了誰。
// 動態消息要從「自己 + 追蹤的人」這 k 個各自有序的推文串列裡，挑出最新的 10 則，就是合併 k 個有序串列：
// 先把每個人最新的一則放進最大堆，每次彈出最新的那則，再把同一個人的前一則推文放進堆，直到拿滿 10 則或堆空了。
// postTweet / follow / unfollow O(1)，getNewsFeed O(k log k)；空間 O(推文數 + 追蹤關係數)。
class Twitter {
private:
    int time;
    unordered_map<int, vector<pair<int, int>>> tweets;
    unordered_map<int, unordered_set<int>> following;

public:
    Twitter() {
        time = 0;
    }

    void postTweet(int userId, int tweetId) {
        tweets[userId].push_back({time, tweetId});
        time++;
    }

    vector<int> getNewsFeed(int userId) {
        unordered_set<int> users = following[userId];
        users.insert(userId);

        priority_queue<tuple<int, int, int>> heap;
        for (int user : users) {
            vector<pair<int, int>>& userTweets = tweets[user];
            if (!userTweets.empty()) {
                int lastIndex = userTweets.size() - 1;
                heap.push({userTweets[lastIndex].first, user, lastIndex});
            }
        }

        vector<int> feed;
        while (!heap.empty() && feed.size() < 10) {
            auto [postTime, user, index] = heap.top();
            heap.pop();
            feed.push_back(tweets[user][index].second);
            if (index > 0) {
                heap.push({tweets[user][index - 1].first, user, index - 1});
            }
        }
        return feed;
    }

    void follow(int followerId, int followeeId) {
        following[followerId].insert(followeeId);
    }

    void unfollow(int followerId, int followeeId) {
        following[followerId].erase(followeeId);
    }
};
