# 序列化：前序遍歷，每個節點寫出它的值，遇到空節點寫 "#"，用逗號隔開。
# 有了空節點標記，每個節點的左右子樹在哪裡結束都很明確，只靠前序就能唯一還原整棵樹。
# 反序列化：照同樣的前序順序依序讀取，讀到 "#" 回傳空節點，否則建立節點後先建左子樹、再建右子樹。
# 兩個方向都是 O(n) 時間，空間 O(n)。
class Codec:

    def serialize(self, root):
        tokens = []

        def preorder(node):
            if node is None:
                tokens.append("#")
                return
            tokens.append(str(node.val))
            preorder(node.left)
            preorder(node.right)

        preorder(root)
        return ",".join(tokens)

    def deserialize(self, data):
        tokens = iter(data.split(","))

        def build():
            token = next(tokens)
            if token == "#":
                return None
            node = TreeNode(int(token))
            node.left = build()
            node.right = build()
            return node

        return build()
