# 分離鏈結法：桶陣列從 8 個桶開始，key 放進第 key % 桶數 個桶，同一個桶裡的 key 存成一個串列。
# 新增前先在桶裡找，找到就不重複加；刪除時在桶裡找到就拿掉。
# 存放的 key 數超過桶數時，桶數加倍並把所有 key 重新分配，所以平均每個桶最多 1 個 key。
# 加倍時搬動 n 個 key 的成本，分攤到之前的 n 次新增，每次只多 O(1)。
# 每次操作期望均攤 O(1)，空間 O(n)，n 是同時存放過最多的 key 數。
class MyHashSet:

    def __init__(self):
        self.buckets = [[] for _ in range(8)]
        self.size = 0

    def get_bucket(self, key: int) -> List[int]:
        return self.buckets[key % len(self.buckets)]

    def rehash(self) -> None:
        old_buckets = self.buckets
        self.buckets = [[] for _ in range(len(old_buckets) * 2)]
        for bucket in old_buckets:
            for key in bucket:
                self.get_bucket(key).append(key)

    def add(self, key: int) -> None:
        bucket = self.get_bucket(key)
        if key in bucket:
            return
        bucket.append(key)
        self.size += 1
        if self.size > len(self.buckets):
            self.rehash()

    def remove(self, key: int) -> None:
        bucket = self.get_bucket(key)
        if key in bucket:
            bucket.remove(key)
            self.size -= 1

    def contains(self, key: int) -> bool:
        return key in self.get_bucket(key)
