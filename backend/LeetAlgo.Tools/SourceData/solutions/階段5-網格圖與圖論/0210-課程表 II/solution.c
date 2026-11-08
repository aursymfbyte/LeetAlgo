// 把 [a, b] 看成邊 b → a（先修 b 才能修 a），用拓撲排序（Kahn 演算法）排出修課順序。
// inDegree[c] 是課程 c 還有幾門先修課沒修完。先把入度為 0 的課放進佇列，
// 每從佇列拿出一門課就把它接到答案後面，再把它指向的課入度減一，減到 0 的放進佇列。
// 佇列裡依序拿出來的課就是答案，所以直接用答案陣列當佇列。
// 如果答案裡的課數不到總課數，代表有環，回傳空陣列。
// 時間 O(n + m)，空間 O(n + m)，m 是先修條件數。
int* findOrder(int numCourses, int** prerequisites, int prerequisitesSize, int* prerequisitesColSize, int* returnSize) {
    int* outDegree = calloc(numCourses, sizeof(int));
    int* inDegree = calloc(numCourses, sizeof(int));
    for (int i = 0; i < prerequisitesSize; i++) {
        outDegree[prerequisites[i][1]]++;
        inDegree[prerequisites[i][0]]++;
    }

    int** nextCourses = malloc(sizeof(int*) * numCourses);
    int* nextCount = calloc(numCourses, sizeof(int));
    for (int course = 0; course < numCourses; course++) {
        nextCourses[course] = malloc(sizeof(int) * outDegree[course]);
    }
    for (int i = 0; i < prerequisitesSize; i++) {
        int course = prerequisites[i][0];
        int prerequisite = prerequisites[i][1];
        nextCourses[prerequisite][nextCount[prerequisite]] = course;
        nextCount[prerequisite]++;
    }

    int* order = malloc(sizeof(int) * numCourses);
    int head = 0;
    int tail = 0;
    for (int course = 0; course < numCourses; course++) {
        if (inDegree[course] == 0) {
            order[tail] = course;
            tail++;
        }
    }

    while (head < tail) {
        int course = order[head];
        head++;
        for (int i = 0; i < nextCount[course]; i++) {
            int nextCourse = nextCourses[course][i];
            inDegree[nextCourse]--;
            if (inDegree[nextCourse] == 0) {
                order[tail] = nextCourse;
                tail++;
            }
        }
    }

    for (int course = 0; course < numCourses; course++) {
        free(nextCourses[course]);
    }
    free(nextCourses);
    free(nextCount);
    free(outDegree);
    free(inDegree);

    if (tail < numCourses) {
        *returnSize = 0;
    } else {
        *returnSize = numCourses;
    }
    return order;
}
