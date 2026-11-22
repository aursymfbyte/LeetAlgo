import { ProblemAnimation } from "./types";
import * as monotonic from "./stacksAndQueues/monotonic";
import * as stackOperations from "./stacksAndQueues/stackOperations";
import * as stackParsing from "./stacksAndQueues/stackParsing";

const histogramHeights = [2, 3, 5, 6, 4, 5];
const rpnTokens = ["9", "6", "4", "2", "-", "*", "+"];
const minStackOps = ["放 5", "放 3", "放 4", "放 1", "取最小", "彈出", "看頂端", "取最小", "彈出", "取最小"];
const queueOps = ["放 1", "放 2", "看隊首", "取出", "放 3", "放 4", "取出", "取出"];
const windowNumbers = [6, 4, 2, 1, 3, 5, 2, 4];
const queryNumbers = [2, 5, 1, 3];
const sourceNumbers = [4, 1, 2, 6, 5, 3];
const asteroidSizes = [-2, 7, 5, 3, -3, 1, -4, -8];
const dayTemperatures = [76, 73, 71, 72, 69, 70, 75];
const dayPrices = [90, 50, 60, 55, 70, 65, 80, 85];

export const stage3: ProblemAnimation[] = [
  {
    problemId: 20,
    brute: stackParsing.bracketsDeletePairs("([{[()]}])"),
    efficient: stackParsing.bracketsStack("([{[()]}])"),
  },
  {
    problemId: 84,
    brute: monotonic.rectangleBrute(histogramHeights),
    efficient: monotonic.rectangleStack(histogramHeights),
  },
  {
    problemId: 150,
    brute: stackParsing.rpnRescan(rpnTokens),
    efficient: stackParsing.rpnStack(rpnTokens),
  },
  {
    problemId: 155,
    brute: stackOperations.minStackScan(minStackOps),
    efficient: stackOperations.minStackTwoStacks(minStackOps),
  },
  {
    problemId: 232,
    brute: stackOperations.queueMoveBack(queueOps),
    efficient: stackOperations.queueTwoStacks(queueOps),
  },
  {
    problemId: 239,
    brute: monotonic.windowMaxScan(windowNumbers, 4),
    efficient: monotonic.windowMaxQueue(windowNumbers, 4),
  },
  {
    problemId: 394,
    brute: stackParsing.decodeRescan("3[a2[c]]"),
    efficient: stackParsing.decodeStack("3[a2[c]]"),
  },
  {
    problemId: 496,
    brute: monotonic.nextGreaterScan(queryNumbers, sourceNumbers),
    efficient: monotonic.nextGreaterStack(queryNumbers, sourceNumbers),
  },
  {
    problemId: 735,
    brute: stackOperations.asteroidsRescan(asteroidSizes),
    efficient: stackOperations.asteroidsStack(asteroidSizes),
  },
  {
    problemId: 739,
    brute: monotonic.temperaturesScan(dayTemperatures),
    efficient: monotonic.temperaturesStack(dayTemperatures),
  },
  {
    problemId: 901,
    brute: monotonic.spanScan(dayPrices),
    efficient: monotonic.spanStack(dayPrices),
  },
  {
    problemId: 2390,
    brute: stackParsing.starsRescan("stack**r*y"),
    efficient: stackParsing.starsStack("stack**r*y"),
  },
];
