import { ProblemAnimation } from "./types";
import * as arrayWindows from "./twoPointersAndWindows/arrayWindows";
import * as pointerScans from "./twoPointersAndWindows/pointerScans";
import * as stringWindows from "./twoPointersAndWindows/stringWindows";

const pairNumbers = [1, 2, 4, 6, 8, 11, 15];
const windowNumbers = [2, 3, 1, 2, 4, 3];
const containerHeights = [3, 8, 6, 2, 5, 9, 4];
const threeSumNumbers = [-1, 0, 3, 1, -1, -5];
const rainHeights = [1, 0, 2, 0, 4, 0, 3, 1];
const stockPrices = [7, 1, 5, 3, 6, 4];
const averageNumbers = [1, 12, -5, -6, 50, 3, -8];
const productNumbers = [10, 5, 2, 6, 3, 4];
const onesNumbers = [1, 0, 1, 1, 0, 1, 1];

export const stage1: ProblemAnimation[] = [
  {
    problemId: 3,
    brute: stringWindows.longestUniqueBrute("abcbdea"),
    efficient: stringWindows.longestUniqueWindow("abcbdea"),
  },
  {
    problemId: 11,
    brute: pointerScans.containerBrute(containerHeights),
    efficient: pointerScans.containerTwoPointers(containerHeights),
  },
  {
    problemId: 15,
    brute: pointerScans.threeSumBrute(threeSumNumbers),
    efficient: pointerScans.threeSumTwoPointers(threeSumNumbers),
  },
  {
    problemId: 42,
    brute: pointerScans.rainBrute(rainHeights),
    efficient: pointerScans.rainTwoPointers(rainHeights),
  },
  {
    problemId: 76,
    brute: stringWindows.minWindowBrute("ADBCBA", "ABC"),
    efficient: stringWindows.minWindowSliding("ADBCBA", "ABC"),
  },
  {
    problemId: 121,
    brute: pointerScans.stockBrute(stockPrices),
    efficient: pointerScans.stockLowestSoFar(stockPrices),
  },
  {
    problemId: 125,
    brute: pointerScans.palindromeReverse("Top-spot!"),
    efficient: pointerScans.palindromeTwoPointers("Top-spot!"),
  },
  {
    problemId: 167,
    brute: pointerScans.allPairs(pairNumbers, 19),
    efficient: pointerScans.twoPointers(pairNumbers, 19),
  },
  {
    problemId: 209,
    brute: arrayWindows.allSubarrays(windowNumbers, 7),
    efficient: arrayWindows.slidingWindow(windowNumbers, 7),
  },
  {
    problemId: 424,
    brute: stringWindows.replaceBrute("AABABBA", 1),
    efficient: stringWindows.replaceWindow("AABABBA", 1),
  },
  {
    problemId: 438,
    brute: stringWindows.anagramsBrute("cbaebac", "abc"),
    efficient: stringWindows.anagramsWindow("cbaebac", "abc"),
  },
  {
    problemId: 567,
    brute: stringWindows.permutationBrute("abc", "eicbao"),
    efficient: stringWindows.permutationWindow("abc", "eicbao"),
  },
  {
    problemId: 643,
    brute: arrayWindows.averageBrute(averageNumbers, 4),
    efficient: arrayWindows.averageWindow(averageNumbers, 4),
  },
  {
    problemId: 713,
    brute: arrayWindows.productBrute(productNumbers, 100),
    efficient: arrayWindows.productWindow(productNumbers, 100),
  },
  {
    problemId: 1004,
    brute: arrayWindows.onesBrute(onesNumbers, 1),
    efficient: arrayWindows.onesWindow(onesNumbers, 1),
  },
];
