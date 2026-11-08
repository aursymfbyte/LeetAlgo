# 把 [a, b] 看成邊 b → a（先修 b 才能修 a），用拓撲排序（Kahn 演算法）判斷有沒有環。
# in_degree[c] 是課程 c 還有幾門先修課沒修完。先把入度為 0 的課放進佇列，
# 每修完一門課，就把它指向的課入度減一，減到 0 的課也可以修了，放進佇列。
# 如果最後修完的課數等於總課數就沒有環；有環的話環上的課入度永遠不會變 0。
# 時間 O(n + m)，空間 O(n + m)，m 是先修條件數。
from collections import deque


class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        next_courses = [[] for _ in range(numCourses)]
        in_degree = [0] * numCourses
        for course, prerequisite in prerequisites:
            next_courses[prerequisite].append(course)
            in_degree[course] += 1

        queue = deque()
        for course in range(numCourses):
            if in_degree[course] == 0:
                queue.append(course)

        finished = 0
        while queue:
            course = queue.popleft()
            finished += 1
            for next_course in next_courses[course]:
                in_degree[next_course] -= 1
                if in_degree[next_course] == 0:
                    queue.append(next_course)
        return finished == numCourses
