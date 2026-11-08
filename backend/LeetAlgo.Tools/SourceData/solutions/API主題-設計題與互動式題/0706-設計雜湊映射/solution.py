# 分離鏈結法：桶陣列從 8 個桶開始，(key, value) 放進第 key % 桶數 個桶，同一個桶裡的資料存成一個串列。
# put 先在桶裡找 key，找到就改 value，找不到才新增；remove 在桶裡找到就拿掉。
# 存放的 key 數超過桶數時，桶數加倍並把所有資料重新分配，所以平均每個桶最多 1 筆資料。
# 加倍時搬動 n 筆資料的成本，分攤到之前的 n 次新增，每次只多 O(1)。
# 每次操作期望均攤 O(1)，空間 O(n)，n 是同時存放過最多的 key 數。
class MyHashMap:

    def __init__(self):
        self.buckets = [[] for _ in range(8)]
        self.size = 0

    def get_bucket(self, key: int) -> List[tuple]:
        return self.buckets[key % len(self.buckets)]

    def rehash(self) -> None:
        old_buckets = self.buckets
        self.buckets = [[] for _ in range(len(old_buckets) * 2)]
        for bucket in old_buckets:
            for key, value in bucket:
                self.get_bucket(key).append((key, value))

    def put(self, key: int, value: int) -> None:
        bucket = self.get_bucket(key)
        for index, (stored_key, _) in enumerate(bucket):
            if stored_key == key:
                bucket[index] = (key, value)
                return
        bucket.append((key, value))
        self.size += 1
        if self.size > len(self.buckets):
            self.rehash()

    def get(self, key: int) -> int:
        for stored_key, stored_value in self.get_bucket(key):
            if stored_key == key:
                return stored_value
        return -1

    def remove(self, key: int) -> None:
        bucket = self.get_bucket(key)
        for index, (stored_key, _) in enumerate(bucket):
            if stored_key == key:
                bucket.pop(index)
                self.size -= 1
                return
