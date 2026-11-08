# 把 [a, b] 看成邊 b → a（先修 b 才能修 a），用拓撲排序（Kahn 演算法）排出修課順序。
# in_degree[c] 是課程 c 還有幾門先修課沒修完。先把入度為 0 的課放進佇列，
# 每從佇列拿出一門課就把它接到答案後面，再把它指向的課入度減一，減到 0 的放進佇列。
# 如果答案裡的課數不到總課數，代表有環，回傳空陣列。
# 時間 O(n + m)，空間 O(n + m)，m 是先修條件數。
from collections import deque


class Solution:
    def findOrder(self, numCourses: int, prerequisites: list[list[int]]) -> list[int]:
        next_courses = [[] for _ in range(numCourses)]
        in_degree = [0] * numCourses
        for course, prerequisite in prerequisites:
            next_courses[prerequisite].append(course)
            in_degree[course] += 1

        queue = deque()
        for course in range(numCourses):
            if in_degree[course] == 0:
                queue.append(course)

        order = []
        while queue:
            course = queue.popleft()
            order.append(course)
            for next_course in next_courses[course]:
                in_degree[next_course] -= 1
                if in_degree[next_course] == 0:
                    queue.append(next_course)

        if len(order) < numCourses:
            return []
        return order
