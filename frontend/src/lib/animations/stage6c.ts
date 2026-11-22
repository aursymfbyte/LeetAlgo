import { ProblemAnimation } from "./types";
import * as gridPaths from "./dynamicProgramming/gridPaths";
import * as knapsack from "./dynamicProgramming/knapsack";
import * as stringSequences from "./dynamicProgramming/stringSequences";

const pathGrid = [
  [1, 3, 1],
  [1, 5, 1],
  [4, 2, 1],
];
const changeCoins = [1, 3, 4];
const partitionNumbers = [1, 1, 2, 2];
const targetNumbers = [1, 2, 1, 2];
const combinationCoins = [1, 2, 3];

export const stage6c: ProblemAnimation[] = [
  {
    problemId: 5,
    brute: stringSequences.palindromeBrute("ababa"),
    efficient: stringSequences.palindromeManacher("ababa"),
  },
  {
    problemId: 62,
    brute: gridPaths.pathsBrute(4, 4),
    efficient: gridPaths.pathsFormula(4, 4),
  },
  {
    problemId: 64,
    brute: gridPaths.minPathBrute(pathGrid),
    efficient: gridPaths.minPathRolling(pathGrid),
  },
  {
    problemId: 72,
    brute: stringSequences.editBrute("tea", "at"),
    efficient: stringSequences.editRolling("tea", "at"),
  },
  {
    problemId: 322,
    brute: knapsack.coinBrute(changeCoins, 5),
    efficient: knapsack.coinTable(changeCoins, 5),
  },
  {
    problemId: 416,
    brute: knapsack.partitionBrute(partitionNumbers),
    efficient: knapsack.partitionTable(partitionNumbers),
  },
  {
    problemId: 494,
    brute: knapsack.targetBrute(targetNumbers, 2),
    efficient: knapsack.targetTable(targetNumbers, 2),
  },
  {
    problemId: 516,
    brute: stringSequences.subsequenceBrute("abcbd"),
    efficient: stringSequences.subsequenceRolling("abcbd"),
  },
  {
    problemId: 518,
    brute: knapsack.combinationBrute(combinationCoins, 3),
    efficient: knapsack.combinationTable(combinationCoins, 3),
  },
  {
    problemId: 1143,
    brute: stringSequences.commonBrute("abcd", "bac"),
    efficient: stringSequences.commonRolling("abcd", "bac"),
  },
];
