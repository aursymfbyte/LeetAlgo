import { ProblemAnimation } from "./types";
import * as boardSearch from "./backtracking/boardSearch";
import * as combinations from "./backtracking/combinations";
import * as stringGeneration from "./backtracking/stringGeneration";

const sumCandidates = [2, 3, 5];
const permuteNumbers = [1, 2, 3];
const subsetNumbers = [1, 2, 3];
const wordGrid = [
  ["B", "S", "T"],
  ["D", "C", "A"],
  ["E", "A", "R"],
];

export const stage4c: ProblemAnimation[] = [
  {
    problemId: 17,
    brute: stringGeneration.lettersByRound("23"),
    efficient: stringGeneration.lettersBacktrack("23"),
  },
  {
    problemId: 22,
    brute: stringGeneration.parenthesesBrute(2),
    efficient: stringGeneration.parenthesesBacktrack(2),
  },
  {
    problemId: 39,
    brute: combinations.combinationSumBrute(sumCandidates, 7),
    efficient: combinations.combinationSumPruned(sumCandidates, 7),
  },
  {
    problemId: 46,
    brute: combinations.permuteBrute(permuteNumbers),
    efficient: combinations.permuteBacktrack(permuteNumbers),
  },
  {
    problemId: 51,
    brute: boardSearch.queensBrute(4),
    efficient: boardSearch.queensBacktrack(4),
  },
  {
    problemId: 77,
    brute: combinations.combineBrute(4, 2),
    efficient: combinations.combineBacktrack(4, 2),
  },
  {
    problemId: 78,
    brute: combinations.subsetsByCopy(subsetNumbers),
    efficient: combinations.subsetsBacktrack(subsetNumbers),
  },
  {
    problemId: 79,
    brute: boardSearch.wordSearchBrute(wordGrid, "CAT"),
    efficient: boardSearch.wordSearchBacktrack(wordGrid, "CAT"),
  },
  {
    problemId: 131,
    brute: stringGeneration.partitionBrute("abac"),
    efficient: stringGeneration.partitionBacktrack("abac"),
  },
  {
    problemId: 216,
    brute: combinations.sumThreeBrute(2, 5),
    efficient: combinations.sumThreeBacktrack(2, 5),
  },
];
