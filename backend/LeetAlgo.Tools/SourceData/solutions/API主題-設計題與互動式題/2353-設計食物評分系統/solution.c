// 用雜湊表記錄每道食物目前的評分和所屬料理，再替每種料理準備一個堆，
// 堆頂是「評分最高、評分相同時名稱字典序最小」的那道食物。
// 改評分時不去堆裡找舊紀錄，而是直接推一筆新的 (新評分, 食物)，舊紀錄留在堆裡變成過期資料（懶刪除）。
// 查詢時看堆頂：如果它記的評分和這道食物目前的評分不同，就是過期的，彈掉再看下一個，直到堆頂有效。
// 建構 O(n log n)，changeRating O(log(n + q))，highestRated 均攤 O(log(n + q))，q 是改評分次數；空間 O(n + q)。
struct HeapItem {
    int rating;
    struct FoodEntry* food;
};

struct CuisineEntry {
    char name[11];
    struct HeapItem* heap;
    int size;
    int capacity;
    UT_hash_handle hh;
};

struct FoodEntry {
    char name[11];
    int rating;
    struct CuisineEntry* cuisine;
    UT_hash_handle hh;
};

typedef struct {
    struct FoodEntry* foods;
    struct CuisineEntry* cuisines;
} FoodRatings;

bool isHigher(struct HeapItem a, struct HeapItem b) {
    if (a.rating != b.rating) {
        return a.rating > b.rating;
    }
    return strcmp(a.food->name, b.food->name) < 0;
}

void swapItems(struct HeapItem* a, struct HeapItem* b) {
    struct HeapItem temp = *a;
    *a = *b;
    *b = temp;
}

void heapPush(struct CuisineEntry* cuisine, struct HeapItem item) {
    if (cuisine->size == cuisine->capacity) {
        cuisine->capacity *= 2;
        cuisine->heap = realloc(cuisine->heap, sizeof(struct HeapItem) * cuisine->capacity);
    }
    struct HeapItem* heap = cuisine->heap;
    int child = cuisine->size;
    heap[child] = item;
    cuisine->size++;
    while (child > 0) {
        int parent = (child - 1) / 2;
        if (!isHigher(heap[child], heap[parent])) {
            break;
        }
        swapItems(&heap[child], &heap[parent]);
        child = parent;
    }
}

void heapPop(struct CuisineEntry* cuisine) {
    struct HeapItem* heap = cuisine->heap;
    cuisine->size--;
    heap[0] = heap[cuisine->size];
    int parent = 0;
    while (true) {
        int left = parent * 2 + 1;
        int right = parent * 2 + 2;
        int best = parent;
        if (left < cuisine->size && isHigher(heap[left], heap[best])) {
            best = left;
        }
        if (right < cuisine->size && isHigher(heap[right], heap[best])) {
            best = right;
        }
        if (best == parent) {
            break;
        }
        swapItems(&heap[parent], &heap[best]);
        parent = best;
    }
}

FoodRatings* foodRatingsCreate(char** foods, int foodsSize, char** cuisines, int cuisinesSize, int* ratings, int ratingsSize) {
    FoodRatings* obj = malloc(sizeof(FoodRatings));
    obj->foods = NULL;
    obj->cuisines = NULL;
    for (int i = 0; i < foodsSize; i++) {
        struct CuisineEntry* cuisine = NULL;
        HASH_FIND_STR(obj->cuisines, cuisines[i], cuisine);
        if (cuisine == NULL) {
            cuisine = malloc(sizeof(struct CuisineEntry));
            strcpy(cuisine->name, cuisines[i]);
            cuisine->size = 0;
            cuisine->capacity = 4;
            cuisine->heap = malloc(sizeof(struct HeapItem) * cuisine->capacity);
            HASH_ADD_STR(obj->cuisines, name, cuisine);
        }

        struct FoodEntry* food = malloc(sizeof(struct FoodEntry));
        strcpy(food->name, foods[i]);
        food->rating = ratings[i];
        food->cuisine = cuisine;
        HASH_ADD_STR(obj->foods, name, food);

        struct HeapItem item = {ratings[i], food};
        heapPush(cuisine, item);
    }
    return obj;
}

void foodRatingsChangeRating(FoodRatings* obj, char* food, int newRating) {
    struct FoodEntry* entry = NULL;
    HASH_FIND_STR(obj->foods, food, entry);
    entry->rating = newRating;
    struct HeapItem item = {newRating, entry};
    heapPush(entry->cuisine, item);
}

char* foodRatingsHighestRated(FoodRatings* obj, char* cuisine) {
    struct CuisineEntry* entry = NULL;
    HASH_FIND_STR(obj->cuisines, cuisine, entry);
    while (entry->heap[0].rating != entry->heap[0].food->rating) {
        heapPop(entry);
    }
    return entry->heap[0].food->name;
}

void foodRatingsFree(FoodRatings* obj) {
    struct CuisineEntry* currentCuisine;
    struct CuisineEntry* nextCuisine;
    HASH_ITER(hh, obj->cuisines, currentCuisine, nextCuisine) {
        HASH_DEL(obj->cuisines, currentCuisine);
        free(currentCuisine->heap);
        free(currentCuisine);
    }

    struct FoodEntry* currentFood;
    struct FoodEntry* nextFood;
    HASH_ITER(hh, obj->foods, currentFood, nextFood) {
        HASH_DEL(obj->foods, currentFood);
        free(currentFood);
    }
    free(obj);
}
