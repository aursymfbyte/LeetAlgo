// 把 [a, b] 看成邊 b → a（先修 b 才能修 a），用拓撲排序（Kahn 演算法）排出修課順序。
// inDegree[c] 是課程 c 還有幾門先修課沒修完。先把入度為 0 的課放進佇列，
// 每從佇列拿出一門課就把它接到答案後面，再把它指向的課入度減一，減到 0 的放進佇列。
// 如果答案裡的課數不到總課數，代表有環，回傳空陣列。
// 時間 O(n + m)，空間 O(n + m)，m 是先修條件數。
class Solution {
public:
    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
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

        vector<int> order;
        while (!ready.empty()) {
            int course = ready.front();
            ready.pop();
            order.push_back(course);
            for (int nextCourse : nextCourses[course]) {
                inDegree[nextCourse]--;
                if (inDegree[nextCourse] == 0) {
                    ready.push(nextCourse);
                }
            }
        }

        if ((int)order.size() < numCourses) {
            return {};
        }
        return order;
    }
};
