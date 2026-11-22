import { Cell, ProblemAnimation } from "./types";
import * as binaryTrees from "./treeAndHeapDesign/binaryTrees";
import * as rankedFeeds from "./treeAndHeapDesign/rankedFeeds";
import * as streamingOrder from "./treeAndHeapDesign/streamingOrder";
import * as tries from "./treeAndHeapDesign/tries";

const iteratorTree: Cell[] = [8, 4, 12, 2, 6, 10, 14];
const iteratorOps = ["建立", "取下一個", "取下一個", "還有嗎", "取下一個", "取下一個", "取下一個", "取下一個", "取下一個", "還有嗎"];
const trieOps = ["加 tea", "加 ten", "加 to", "加 in", "找 to", "找 te", "開頭 te", "開頭 ta"];
const dictionaryOps = ["加 dad", "加 bad", "加 bed", "找 bed", "找 ba", "找 .ed", "找 b.d"];
const medianOps = ["加 5", "加 2", "加 8", "取中位數", "加 1", "取中位數", "加 9", "取中位數", "加 4", "取中位數"];
const codecTree: Cell[] = [1, 2, 3, "", "", 4, 5];
const twitterUsers = ["甲", "乙", "丙"];
const twitterOps = ["乙 發 1", "丙 發 2", "乙 發 3", "丙 發 4", "甲 發 5", "甲 追蹤 乙", "甲 追蹤 丙", "甲 看動態", "甲 退追 丙", "甲 看動態"];
const kthStart = [4, 5, 8, 2];
const kthOps = ["建立", "加 3", "加 5", "加 10", "加 9", "加 4"];
const smallestOps = ["放回 5", "拿最小", "拿最小", "拿最小", "放回 2", "放回 1", "放回 2", "拿最小", "拿最小", "拿最小"];
const foodNames = ["泡菜", "味噌", "壽司", "拉麵", "烤肉"];
const foodCuisines = ["韓式", "日式", "日式", "日式", "韓式"];
const foodRatings = [9, 12, 8, 14, 7];
const foodOps = ["建立", "查 日式", "改 拉麵 6", "查 日式", "改 壽司 15", "查 日式", "改 泡菜 5", "查 韓式"];

export const stage7b: ProblemAnimation[] = [
  {
    problemId: 173,
    brute: binaryTrees.iteratorCopyAll(iteratorTree, iteratorOps),
    efficient: binaryTrees.iteratorStack(iteratorTree, iteratorOps),
  },
  {
    problemId: 208,
    brute: tries.wordListScan(trieOps, "insert"),
    efficient: tries.trieWalk(trieOps),
  },
  {
    problemId: 211,
    brute: tries.wordListScan(dictionaryOps, "addWord"),
    efficient: tries.dictionaryDfs(dictionaryOps),
  },
  {
    problemId: 295,
    brute: streamingOrder.medianSortEach(medianOps),
    efficient: streamingOrder.medianTwoHeaps(medianOps),
  },
  {
    problemId: 297,
    brute: binaryTrees.codecTwoLists(codecTree),
    efficient: binaryTrees.codecPreorderMarks(codecTree),
  },
  {
    problemId: 355,
    brute: rankedFeeds.twitterSortAll(twitterUsers, twitterOps, 3),
    efficient: rankedFeeds.twitterMergeHeap(twitterUsers, twitterOps, 3),
  },
  {
    problemId: 703,
    brute: streamingOrder.kthLargestSortEach(3, kthStart, kthOps),
    efficient: streamingOrder.kthLargestHeap(3, kthStart, kthOps),
  },
  {
    problemId: 2336,
    brute: streamingOrder.smallestSetScan(smallestOps),
    efficient: streamingOrder.smallestSetHeap(smallestOps),
  },
  {
    problemId: 2353,
    brute: rankedFeeds.foodScanAll(foodNames, foodCuisines, foodRatings, foodOps),
    efficient: rankedFeeds.foodHeaps(foodNames, foodCuisines, foodRatings, foodOps),
  },
];
