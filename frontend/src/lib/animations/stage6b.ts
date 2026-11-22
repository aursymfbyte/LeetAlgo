import { Cell, ProblemAnimation } from "./types";
import * as houseRobber from "./sequenceDP/houseRobber";
import * as prefixStates from "./sequenceDP/prefixStates";
import * as stairs from "./sequenceDP/stairs";
import * as trading from "./sequenceDP/trading";

const houseMoney = [2, 7, 9, 3, 1, 8];
const circleMoney = [5, 1, 2, 7, 3, 8];
const risingNumbers = [10, 9, 2, 5, 3, 7, 18];
const cooldownPrices = [1, 2, 3, 0, 2];
const treeMoney: Cell[] = [3, 4, 5, 1, 3, "", 1, 6, "", "", "", "", "", "", ""];
const feePrices = [1, 4, 3, 8];
const stairCosts = [10, 15, 20, 5, 30];

export const stage6b: ProblemAnimation[] = [
  {
    problemId: 70,
    brute: stairs.climbRecursion(5),
    efficient: stairs.climbTwoValues(5),
  },
  {
    problemId: 139,
    brute: prefixStates.wordBreakBrute("aaaab", ["a", "aa", "aaa"]),
    efficient: prefixStates.wordBreakTrie("aaaab", ["a", "aa", "aaa"]),
  },
  {
    problemId: 198,
    brute: houseRobber.robBrute(houseMoney),
    efficient: houseRobber.robTwoValues(houseMoney),
  },
  {
    problemId: 213,
    brute: houseRobber.robCircleBrute(circleMoney),
    efficient: houseRobber.robCircleTwoTrips(circleMoney),
  },
  {
    problemId: 300,
    brute: prefixStates.lisCompareAll(risingNumbers),
    efficient: prefixStates.lisBinarySearch(risingNumbers),
  },
  {
    problemId: 309,
    brute: trading.tradeBrute(cooldownPrices, 1, 0),
    efficient: trading.cooldownStates(cooldownPrices),
  },
  {
    problemId: 337,
    brute: houseRobber.robTreeBrute(treeMoney),
    efficient: houseRobber.robTreeOnce(treeMoney),
  },
  {
    problemId: 714,
    brute: trading.tradeBrute(feePrices, 0, 2),
    efficient: trading.feeStates(feePrices, 2),
  },
  {
    problemId: 746,
    brute: stairs.minCostRecursion(stairCosts),
    efficient: stairs.minCostTwoValues(stairCosts),
  },
];
