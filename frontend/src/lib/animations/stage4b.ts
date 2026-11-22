import { Cell, ProblemAnimation } from "./types";
import * as depthAndPaths from "./binaryTrees/depthAndPaths";
import * as levelTraversal from "./binaryTrees/levelTraversal";
import * as searchTrees from "./binaryTrees/searchTrees";
import * as treeStructure from "./binaryTrees/treeStructure";

const searchTree: Cell[] = [8, 4, 12, 2, 6, 10, 14, "", "", "", "", 9, 13, "", ""];
const sameP: Cell[] = [1, 2, 3, 4, "", "", ""];
const sameQ: Cell[] = [1, 2, 3, 5, "", "", ""];
const mirrorTree: Cell[] = [1, 2, 2, 3, 4, 5, 3];
const levelTree: Cell[] = [3, 9, 20, "", "", 15, 7];
const buildPreorder = [3, 9, 20, 15, 7];
const buildInorder = [9, 3, 15, 20, 7];
const leaningTree: Cell[] = [1, 2, 5, 3, "", 6, "", 4, "", "", "", "", "", "", ""];
const pathTree: Cell[] = [-10, 9, 20, -3, 4, 15, 7];
const viewTree: Cell[] = [1, 2, 3, 4, 5, "", ""];
const invertTree: Cell[] = [4, 2, 7, 1, 3, 6, 9];
const kthTree: Cell[] = [5, 3, 7, 2, 4, 6, 8];
const ancestorTree: Cell[] = [3, 5, 1, 6, 2, 0, 8, "", "", 7, 4, "", "", "", ""];
const diameterTree: Cell[] = [1, 2, "", 4, 5, "", "", 6, "", "", 7, "", "", "", ""];

export const stage4b: ProblemAnimation[] = [
  {
    problemId: 98,
    brute: searchTrees.bstScanSubtrees(searchTree),
    efficient: searchTrees.bstBounds(searchTree),
  },
  {
    problemId: 100,
    brute: treeStructure.sameTreeLists(sameP, sameQ),
    efficient: treeStructure.sameTreeTogether(sameP, sameQ),
  },
  {
    problemId: 101,
    brute: treeStructure.symmetricLists(mirrorTree),
    efficient: treeStructure.symmetricMirror(mirrorTree),
  },
  {
    problemId: 102,
    brute: levelTraversal.levelOrderFromRoot(levelTree),
    efficient: levelTraversal.levelOrderQueue(levelTree),
  },
  {
    problemId: 104,
    brute: depthAndPaths.depthEveryLeaf(levelTree),
    efficient: depthAndPaths.depthBottomUp(levelTree),
  },
  {
    problemId: 105,
    brute: treeStructure.buildSearch(buildPreorder, buildInorder),
    efficient: treeStructure.buildHashMap(buildPreorder, buildInorder),
  },
  {
    problemId: 110,
    brute: depthAndPaths.balancedRecount(leaningTree),
    efficient: depthAndPaths.balancedOnePass(leaningTree),
  },
  {
    problemId: 124,
    brute: depthAndPaths.pathSumRecount(pathTree),
    efficient: depthAndPaths.pathSumOnePass(pathTree),
  },
  {
    problemId: 199,
    brute: levelTraversal.rightViewFromRoot(viewTree),
    efficient: levelTraversal.rightViewRightFirst(viewTree),
  },
  {
    problemId: 226,
    brute: treeStructure.invertCopy(invertTree),
    efficient: treeStructure.invertInPlace(invertTree),
  },
  {
    problemId: 230,
    brute: searchTrees.kthSmallestSort(kthTree, 3),
    efficient: searchTrees.kthSmallestInorder(kthTree, 3),
  },
  {
    problemId: 236,
    brute: depthAndPaths.ancestorSearchEach(ancestorTree, 7, 4),
    efficient: depthAndPaths.ancestorOnePass(ancestorTree, 7, 4),
  },
  {
    problemId: 543,
    brute: depthAndPaths.diameterRecount(diameterTree),
    efficient: depthAndPaths.diameterOnePass(diameterTree),
  },
];
