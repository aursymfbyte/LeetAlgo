// 把 [a, b] 看成邊 b → a（先修 b 才能修 a），用拓撲排序（Kahn 演算法）判斷有沒有環。
// inDegree[c] 是課程 c 還有幾門先修課沒修完。先把入度為 0 的課放進佇列，
// 每修完一門課，就把它指向的課入度減一，減到 0 的課也可以修了，放進佇列。
// 如果最後修完的課數等於總課數就沒有環；有環的話環上的課入度永遠不會變 0。
// 時間 O(n + m)，空間 O(n + m)，m 是先修條件數。
bool canFinish(int numCourses, int** prerequisites, int prerequisitesSize, int* prerequisitesColSize) {
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

    int* queue = malloc(sizeof(int) * numCourses);
    int head = 0;
    int tail = 0;
    for (int course = 0; course < numCourses; course++) {
        if (inDegree[course] == 0) {
            queue[tail] = course;
            tail++;
        }
    }

    int finished = 0;
    while (head < tail) {
        int course = queue[head];
        head++;
        finished++;
        for (int i = 0; i < nextCount[course]; i++) {
            int nextCourse = nextCourses[course][i];
            inDegree[nextCourse]--;
            if (inDegree[nextCourse] == 0) {
                queue[tail] = nextCourse;
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
    free(queue);
    return finished == numCourses;
}
