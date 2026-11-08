# 用一個全域遞增的 time 當發文時間。每位使用者的推文依序放在自己的陣列尾端，越後面越新；
# 另外用雜湊表記錄每個人追蹤了誰。
# 動態消息要從「自己 + 追蹤的人」這 k 個各自有序的推文串列裡，挑出最新的 10 則，就是合併 k 個有序串列：
# 先把每個人最新的一則放進最大堆，每次彈出最新的那則，再把同一個人的前一則推文放進堆，直到拿滿 10 則或堆空了。
# postTweet / follow / unfollow O(1)，getNewsFeed O(k log k)；空間 O(推文數 + 追蹤關係數)。
import heapq
from collections import defaultdict


class Twitter:

    def __init__(self):
        self.time = 0
        self.tweets = defaultdict(list)
        self.following = defaultdict(set)

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.tweets[userId].append((self.time, tweetId))
        self.time += 1

    def getNewsFeed(self, userId: int) -> list[int]:
        users = set(self.following[userId])
        users.add(userId)

        heap = []
        for user in users:
            user_tweets = self.tweets[user]
            if len(user_tweets) > 0:
                last_index = len(user_tweets) - 1
                post_time = user_tweets[last_index][0]
                heapq.heappush(heap, (-post_time, user, last_index))

        feed = []
        while len(heap) > 0 and len(feed) < 10:
            _, user, index = heapq.heappop(heap)
            feed.append(self.tweets[user][index][1])
            if index > 0:
                post_time = self.tweets[user][index - 1][0]
                heapq.heappush(heap, (-post_time, user, index - 1))
        return feed

    def follow(self, followerId: int, followeeId: int) -> None:
        self.following[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        self.following[followerId].discard(followeeId)
