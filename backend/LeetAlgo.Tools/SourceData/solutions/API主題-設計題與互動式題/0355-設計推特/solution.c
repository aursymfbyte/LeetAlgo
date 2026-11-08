// 用一個全域遞增的 time 當發文時間。每位使用者的推文依序放在自己的陣列尾端，越後面越新；
// 使用者編號最多 500，所以直接用 follows[a][b] 記錄 a 是否追蹤 b。
// 動態消息要從「自己 + 追蹤的人」這 k 個各自有序的推文串列裡，挑出最新的 10 則，就是合併 k 個有序串列：
// 先把每個人最新的一則放進最大堆，每次彈出最新的那則，再把同一個人的前一則推文放進堆，直到拿滿 10 則或堆空了。
// postTweet 均攤 O(1)，follow / unfollow O(1)，getNewsFeed O(U + k log k)，U = 500；空間 O(推文數 + U^2)。
#define MAX_USERS 501
#define FEED_SIZE 10

struct Tweet {
    int time;
    int tweetId;
};

struct UserTweets {
    struct Tweet* tweets;
    int size;
    int capacity;
};

struct HeapItem {
    int time;
    int userId;
    int index;
};

typedef struct {
    int time;
    struct UserTweets users[MAX_USERS];
    bool follows[MAX_USERS][MAX_USERS];
} Twitter;

Twitter* twitterCreate() {
    Twitter* obj = malloc(sizeof(Twitter));
    obj->time = 0;
    for (int user = 0; user < MAX_USERS; user++) {
        obj->users[user].tweets = NULL;
        obj->users[user].size = 0;
        obj->users[user].capacity = 0;
        for (int other = 0; other < MAX_USERS; other++) {
            obj->follows[user][other] = false;
        }
    }
    return obj;
}

void twitterPostTweet(Twitter* obj, int userId, int tweetId) {
    struct UserTweets* user = &obj->users[userId];
    if (user->size == user->capacity) {
        if (user->capacity == 0) {
            user->capacity = 4;
        } else {
            user->capacity *= 2;
        }
        user->tweets = realloc(user->tweets, sizeof(struct Tweet) * user->capacity);
    }
    user->tweets[user->size].time = obj->time;
    user->tweets[user->size].tweetId = tweetId;
    user->size++;
    obj->time++;
}

void swapItems(struct HeapItem* a, struct HeapItem* b) {
    struct HeapItem temp = *a;
    *a = *b;
    *b = temp;
}

void heapPush(struct HeapItem* heap, int* heapSize, struct HeapItem item) {
    int child = *heapSize;
    heap[child] = item;
    (*heapSize)++;
    while (child > 0) {
        int parent = (child - 1) / 2;
        if (heap[parent].time >= heap[child].time) {
            break;
        }
        swapItems(&heap[parent], &heap[child]);
        child = parent;
    }
}

struct HeapItem heapPop(struct HeapItem* heap, int* heapSize) {
    struct HeapItem top = heap[0];
    (*heapSize)--;
    heap[0] = heap[*heapSize];
    int parent = 0;
    while (true) {
        int left = parent * 2 + 1;
        int right = parent * 2 + 2;
        int largest = parent;
        if (left < *heapSize && heap[left].time > heap[largest].time) {
            largest = left;
        }
        if (right < *heapSize && heap[right].time > heap[largest].time) {
            largest = right;
        }
        if (largest == parent) {
            break;
        }
        swapItems(&heap[parent], &heap[largest]);
        parent = largest;
    }
    return top;
}

int* twitterGetNewsFeed(Twitter* obj, int userId, int* retSize) {
    struct HeapItem heap[MAX_USERS];
    int heapSize = 0;
    for (int user = 1; user < MAX_USERS; user++) {
        bool isVisible = user == userId || obj->follows[userId][user];
        if (isVisible && obj->users[user].size > 0) {
            int lastIndex = obj->users[user].size - 1;
            struct HeapItem item = {obj->users[user].tweets[lastIndex].time, user, lastIndex};
            heapPush(heap, &heapSize, item);
        }
    }

    int* feed = malloc(sizeof(int) * FEED_SIZE);
    *retSize = 0;
    while (heapSize > 0 && *retSize < FEED_SIZE) {
        struct HeapItem top = heapPop(heap, &heapSize);
        struct UserTweets* user = &obj->users[top.userId];
        feed[*retSize] = user->tweets[top.index].tweetId;
        (*retSize)++;
        if (top.index > 0) {
            struct HeapItem item = {user->tweets[top.index - 1].time, top.userId, top.index - 1};
            heapPush(heap, &heapSize, item);
        }
    }
    return feed;
}

void twitterFollow(Twitter* obj, int followerId, int followeeId) {
    obj->follows[followerId][followeeId] = true;
}

void twitterUnfollow(Twitter* obj, int followerId, int followeeId) {
    obj->follows[followerId][followeeId] = false;
}

void twitterFree(Twitter* obj) {
    for (int user = 0; user < MAX_USERS; user++) {
        free(obj->users[user].tweets);
    }
    free(obj);
}
