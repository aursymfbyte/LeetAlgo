# 用佇列當滑動視窗，依時間順序存下每次請求。
# 因為 t 嚴格遞增，比 t - 3000 還早的請求以後也不會再落入視窗，可以直接從隊首丟掉，
# 丟完之後佇列的長度就是答案。
# 每個請求只進出佇列各一次，均攤每次 O(1)；空間 O(3000)，視窗內最多 3001 個請求。
from collections import deque


class RecentCounter:

    def __init__(self):
        self.requests = deque()

    def ping(self, t: int) -> int:
        self.requests.append(t)
        while self.requests[0] < t - 3000:
            self.requests.popleft()
        return len(self.requests)
