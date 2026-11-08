# 用一個陣列依序存瀏覽過的網址，current 是目前所在的位置，last 是還能往前走到的最後位置。
# visit 時把網址寫在 current + 1，並把 last 設成新的 current，等於丟掉原本的前進紀錄。
# back / forward 只要移動 current，並夾在 0 和 last 之間。
# visit 均攤 O(1)，back / forward 都是 O(1)，空間 O(n)。
class BrowserHistory:

    def __init__(self, homepage: str):
        self.history = [homepage]
        self.current = 0
        self.last = 0

    def visit(self, url: str) -> None:
        self.current += 1
        if self.current == len(self.history):
            self.history.append(url)
        else:
            self.history[self.current] = url
        self.last = self.current

    def back(self, steps: int) -> str:
        self.current = max(0, self.current - steps)
        return self.history[self.current]

    def forward(self, steps: int) -> str:
        self.current = min(self.last, self.current + steps)
        return self.history[self.current]
