// 把 [a, b] 看成邊 b → a（先修 b 才能修 a），用拓撲排序（Kahn 演算法）判斷有沒有環。
// inDegree[c] 是課程 c 還有幾門先修課沒修完。先把入度為 0 的課放進佇列，
// 每修完一門課，就把它指向的課入度減一，減到 0 的課也可以修了，放進佇列。
// 如果最後修完的課數等於總課數就沒有環；有環的話環上的課入度永遠不會變 0。
// 時間 O(n + m)，空間 O(n + m)，m 是先修條件數。
class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> nextCourses(numCourses);
        vector<int> inDegree(numCourses, 0);
        for (auto& pair : prerequisites) {
            nextCourses[pair[1]].push_back(pair[0]);
            inDegree[pair[0]]++;
        }

        queue<int> ready;
        for (int course = 0; course < numCourses; course++) {
            if (inDegree[course] == 0) {
                ready.push(course);
            }
        }

        int finished = 0;
        while (!ready.empty()) {
            int course = ready.front();
            ready.pop();
            finished++;
            for (int nextCourse : nextCourses[course]) {
                inDegree[nextCourse]--;
                if (inDegree[nextCourse] == 0) {
                    ready.push(nextCourse);
                }
            }
        }
        return finished == numCourses;
    }
};
