import { ProblemAnimation } from "./types";
import * as intervals from "./greedy/intervals";
import * as jumpsAndRoutes from "./greedy/jumpsAndRoutes";
import * as runningOptima from "./greedy/runningOptima";

const jumpSteps = [2, 3, 1, 1, 2, 1, 1];
const subarrayNumbers = [-2, 3, -1, 2, -6, 3];
const blockedSteps = [5, 3, 3, 2, 1, 0, 4];
const mergeIntervals = [
  [1, 3],
  [8, 10],
  [2, 6],
  [15, 18],
  [9, 12],
  [5, 7],
];
const stockPrices = [1, 5, 3, 6];
const stationGas = [3, 3, 1, 4, 2, 3];
const stationCost = [2, 2, 5, 2, 3, 2];
const eraseIntervals = [
  [1, 4],
  [3, 5],
  [2, 3],
  [4, 6],
];
const balloons = [
  [10, 16],
  [2, 8],
  [1, 6],
  [7, 12],
];

export const stage6a: ProblemAnimation[] = [
  {
    problemId: 45,
    brute: jumpsAndRoutes.minJumpsBrute(jumpSteps),
    efficient: jumpsAndRoutes.minJumpsBridge(jumpSteps),
  },
  {
    problemId: 53,
    brute: runningOptima.maxSubarrayBrute(subarrayNumbers),
    efficient: runningOptima.maxSubarrayKadane(subarrayNumbers),
  },
  {
    problemId: 55,
    brute: jumpsAndRoutes.canJumpBrute(blockedSteps),
    efficient: jumpsAndRoutes.canJumpFarthest(blockedSteps),
  },
  {
    problemId: 56,
    brute: intervals.mergeBrute(mergeIntervals),
    efficient: intervals.mergeSorted(mergeIntervals),
  },
  {
    problemId: 122,
    brute: runningOptima.stockChoicesBrute(stockPrices),
    efficient: runningOptima.stockStates(stockPrices),
  },
  {
    problemId: 134,
    brute: jumpsAndRoutes.gasBrute(stationGas, stationCost),
    efficient: jumpsAndRoutes.gasLowestPoint(stationGas, stationCost),
  },
  {
    problemId: 435,
    brute: intervals.eraseBrute(eraseIntervals),
    efficient: intervals.eraseSorted(eraseIntervals),
  },
  {
    problemId: 452,
    brute: intervals.arrowsBrute(balloons),
    efficient: intervals.arrowsSorted(balloons),
  },
  {
    problemId: 763,
    brute: intervals.partitionBrute("abacbdedf"),
    efficient: intervals.partitionLastSeen("abacbdedf"),
  },
];
