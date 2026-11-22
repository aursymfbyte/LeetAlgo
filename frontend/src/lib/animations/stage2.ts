import { ProblemAnimation } from "./types";
import * as answerSearch from "./binarySearch/answerSearch";
import * as orderedSearch from "./binarySearch/orderedSearch";
import * as rotationsAndPeaks from "./binarySearch/rotationsAndPeaks";

const searchNumbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
const rotatedNumbers = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
const repeatedNumbers = [1, 2, 3, 4, 6, 8, 8, 8, 9, 10];
const sortedMatrix = [
  [1, 3, 5, 7],
  [10, 11, 16, 20],
  [23, 30, 34, 60],
];
const rotatedForMin = [11, 13, 15, 17, 19, 21, 23, 2, 5, 8];
const hillNumbers = [1, 3, 4, 6, 7, 9, 10, 12, 8, 5];
const citationCounts = [0, 1, 1, 2, 3, 3, 5, 8, 9];
const bananaPiles = [3, 7, 10, 5];
const spellPowers = [5, 1, 3];
const potionPowers = [4, 1, 6, 2, 7, 3, 5];

export const stage2: ProblemAnimation[] = [
  {
    problemId: 33,
    brute: orderedSearch.linearSearch(rotatedNumbers, 2),
    efficient: rotationsAndPeaks.rotatedSearch(rotatedNumbers, 2),
  },
  {
    problemId: 34,
    brute: orderedSearch.rangeScan(repeatedNumbers, 8),
    efficient: orderedSearch.rangeBinary(repeatedNumbers, 8),
  },
  {
    problemId: 35,
    brute: orderedSearch.insertScan(searchNumbers, 14),
    efficient: orderedSearch.insertBinary(searchNumbers, 14),
  },
  {
    problemId: 74,
    brute: orderedSearch.matrixScan(sortedMatrix, 34),
    efficient: orderedSearch.matrixBinary(sortedMatrix, 34),
  },
  {
    problemId: 153,
    brute: rotationsAndPeaks.minScan(rotatedForMin),
    efficient: rotationsAndPeaks.minBinary(rotatedForMin),
  },
  {
    problemId: 162,
    brute: rotationsAndPeaks.peakScan(hillNumbers),
    efficient: rotationsAndPeaks.peakBinary(hillNumbers),
  },
  {
    problemId: 275,
    brute: answerSearch.hIndexCount(citationCounts),
    efficient: answerSearch.hIndexBinary(citationCounts),
  },
  {
    problemId: 278,
    brute: answerSearch.badVersionScan(10, 7),
    efficient: answerSearch.badVersionBinary(10, 7),
  },
  {
    problemId: 374,
    brute: answerSearch.guessScan(10, 8),
    efficient: answerSearch.guessBinary(10, 8),
  },
  {
    problemId: 704,
    brute: orderedSearch.linearSearch(searchNumbers, 13),
    efficient: orderedSearch.binarySearch(searchNumbers, 13),
  },
  {
    problemId: 875,
    brute: answerSearch.speedScan(bananaPiles, 5),
    efficient: answerSearch.speedBinary(bananaPiles, 5),
  },
  {
    problemId: 2300,
    brute: orderedSearch.pairsAll(spellPowers, potionPowers, 12),
    efficient: orderedSearch.pairsBinary(spellPowers, potionPowers, 12),
  },
];
