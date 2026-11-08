// 跟「二元樹的直徑」同一個想法：每條路徑都有一個最高的轉折點，路徑和 = 轉折點的值 + 左邊往下的最大鏈和 + 右邊往下的最大鏈和。
// 遞迴回傳「從這個節點往下走的最大鏈和」給父節點用；子樹的鏈和如果是負的就不要接，當成 0。
// 回傳給父節點時只能選左右其中一條鏈；答案則用左右兩條鏈都接上的值另外更新。
// 節點值可能全是負數，答案的初始值要設成最小整數，不能設成 0。
// 時間 O(n)，空間 O(h)，h 是樹高。
int maxChainSum(struct TreeNode* node, int* answer) {
    if (node == NULL) {
        return 0;
    }
    int leftChain = maxChainSum(node->left, answer);
    if (leftChain < 0) {
        leftChain = 0;
    }
    int rightChain = maxChainSum(node->right, answer);
    if (rightChain < 0) {
        rightChain = 0;
    }

    int pathSum = node->val + leftChain + rightChain;
    if (pathSum > *answer) {
        *answer = pathSum;
    }

    if (leftChain > rightChain) {
        return node->val + leftChain;
    }
    return node->val + rightChain;
}

int maxPathSum(struct TreeNode* root) {
    int answer = INT_MIN;
    maxChainSum(root, &answer);
    return answer;
}
