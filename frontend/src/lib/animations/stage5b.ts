import { ProblemAnimation } from "./types";
import * as connectivity from "./graphs/connectivity";
import * as courseScheduling from "./graphs/courseScheduling";
import * as graphTraversal from "./graphs/graphTraversal";
import * as shortestPaths from "./graphs/shortestPaths";

const ladderWords = ["hot", "dot", "dog", "lot", "log", "cog"];
const cloneNeighbors = [[], [2, 4], [1, 3], [2, 4], [1, 3]];
const cycleCourses = [
  [1, 2],
  [0, 1],
  [3, 1],
  [3, 5],
  [4, 3],
  [5, 4],
];
const orderCourses = [
  [0, 3],
  [1, 3],
  [2, 0],
  [2, 1],
  [4, 2],
  [3, 5],
];
const cityLinks = [
  [1, 0, 0, 0, 1, 0],
  [0, 1, 0, 1, 0, 0],
  [0, 0, 1, 0, 0, 1],
  [0, 1, 0, 1, 1, 0],
  [1, 0, 0, 1, 1, 0],
  [0, 0, 1, 0, 0, 1],
];
const treeEdges = [
  [1, 2],
  [3, 4],
  [2, 3],
  [4, 5],
  [5, 6],
  [2, 6],
];
const delayTimes = [
  [3, 4, 1],
  [2, 3, 1],
  [1, 2, 1],
  [1, 3, 5],
  [1, 4, 9],
  [2, 4, 4],
  [2, 1, 2],
  [3, 1, 3],
  [4, 1, 1],
  [3, 2, 2],
  [4, 2, 3],
];
const roomKeys = [[4, 5], [2], [], [1, 0], [3, 5], [4]];
const cityRoads = [
  [3, 4],
  [3, 2],
  [1, 2],
  [5, 0],
  [0, 1],
];

export const stage5b: ProblemAnimation[] = [
  {
    problemId: 127,
    brute: shortestPaths.ladderAllPaths("hit", "cog", ladderWords),
    efficient: shortestPaths.ladderBfs("hit", "cog", ladderWords),
  },
  {
    problemId: 133,
    brute: graphTraversal.cloneList(cloneNeighbors),
    efficient: graphTraversal.cloneHashMap(cloneNeighbors),
  },
  {
    problemId: 207,
    brute: courseScheduling.canFinishBrute(6, cycleCourses),
    efficient: courseScheduling.canFinishKahn(6, cycleCourses),
  },
  {
    problemId: 210,
    brute: courseScheduling.findOrderBrute(6, orderCourses),
    efficient: courseScheduling.findOrderKahn(6, orderCourses),
  },
  {
    problemId: 547,
    brute: connectivity.provincesRelabel(cityLinks),
    efficient: connectivity.provincesDfs(cityLinks),
  },
  {
    problemId: 684,
    brute: connectivity.redundantSearch(treeEdges),
    efficient: connectivity.redundantUnionFind(treeEdges),
  },
  {
    problemId: 743,
    brute: shortestPaths.delayRescan(delayTimes, 4, 1),
    efficient: shortestPaths.delayDijkstra(delayTimes, 4, 1),
  },
  {
    problemId: 841,
    brute: graphTraversal.roomsRescan(roomKeys),
    efficient: graphTraversal.roomsDfs(roomKeys),
  },
  {
    problemId: 1466,
    brute: graphTraversal.reorderRescan(6, cityRoads),
    efficient: graphTraversal.reorderBfs(6, cityRoads),
  },
];
