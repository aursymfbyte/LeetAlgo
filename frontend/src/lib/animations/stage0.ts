import { ProblemAnimation } from "./types";
import * as arrayTransforms from "./arraysAndHashing/arrayTransforms";
import * as hashing from "./arraysAndHashing/hashing";
import * as prefixSums from "./arraysAndHashing/prefixSums";

const sumNumbers = [11, 15, 2, 6, 4, 7];
const anagramWords = ["bat", "tan", "eat", "nat", "tea", "ate"];
const runNumbers = [100, 4, 200, 1, 3, 2];
const duplicateNumbers = [2, 7, 5, 1, 8, 3, 5];
const productNumbers = [2, 3, 4, 5, 6];
const zeroNumbers = [0, 1, 0, 3, 12];
const rangeNumbers = [-2, 0, 3, -5, 2, -1];
const rangeQueries = [
  [0, 2],
  [2, 5],
  [0, 5],
];
const frequentNumbers = [1, 1, 1, 2, 2, 3];
const subarrayNumbers = [1, 2, 1, -1, 3];
const pivotNumbers = [1, 7, 3, 6, 5, 6];

export const stage0: ProblemAnimation[] = [
  {
    problemId: 1,
    brute: hashing.twoSumBrute(sumNumbers, 9),
    efficient: hashing.twoSumHashMap(sumNumbers, 9),
  },
  {
    problemId: 49,
    brute: hashing.groupAnagramsPairs(anagramWords),
    efficient: hashing.groupAnagramsCount(anagramWords),
  },
  {
    problemId: 128,
    brute: hashing.longestRunScan(runNumbers),
    efficient: hashing.longestRunSet(runNumbers),
  },
  {
    problemId: 217,
    brute: hashing.duplicatePairs(duplicateNumbers),
    efficient: hashing.duplicateSet(duplicateNumbers),
  },
  {
    problemId: 238,
    brute: arrayTransforms.productBrute(productNumbers),
    efficient: arrayTransforms.productTwoPasses(productNumbers),
  },
  {
    problemId: 242,
    brute: hashing.anagramCrossOut("diaper", "repaid"),
    efficient: hashing.anagramCount("diaper", "repaid"),
  },
  {
    problemId: 283,
    brute: arrayTransforms.moveZeroesSwap(zeroNumbers),
    efficient: arrayTransforms.moveZeroesWrite(zeroNumbers),
  },
  {
    problemId: 303,
    brute: prefixSums.rangeSumAddAgain(rangeNumbers, rangeQueries),
    efficient: prefixSums.rangeSumPrefix(rangeNumbers, rangeQueries),
  },
  {
    problemId: 347,
    brute: hashing.topKCountEach(frequentNumbers, 2),
    efficient: hashing.topKBuckets(frequentNumbers, 2),
  },
  {
    problemId: 560,
    brute: prefixSums.subarraySumBrute(subarrayNumbers, 3),
    efficient: prefixSums.subarraySumPrefix(subarrayNumbers, 3),
  },
  {
    problemId: 724,
    brute: prefixSums.pivotAddAgain(pivotNumbers),
    efficient: prefixSums.pivotTotal(pivotNumbers),
  },
  {
    problemId: 1768,
    brute: arrayTransforms.mergeByConcat("abcd", "pq"),
    efficient: arrayTransforms.mergeByAppend("abcd", "pq"),
  },
];
