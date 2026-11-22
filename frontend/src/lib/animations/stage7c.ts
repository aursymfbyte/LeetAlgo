import { ProblemAnimation } from "./types";
import * as oracleQueries from "./interfaceDesign/oracleQueries";
import * as statefulServices from "./interfaceDesign/statefulServices";
import * as versionedData from "./interfaceDesign/versionedData";

const rand7Rolls = [7, 7, 5, 3, 6, 6, 7, 2, 4, 1, 3, 5];
const guessWords = ["garden", "golden", "gentle", "kettle", "settle", "little", "middle", "paddle"];
const timeMapOps = ["存 1:a", "存 3:b", "存 5:c", "存 8:d", "存 10:e", "存 12:f", "查 11", "查 0", "查 20"];
const mountainHeights = [1, 2, 4, 6, 9, 12, 15, 18, 20, 13, 7, 3];
const snapshotOps = ["設 1,5", "快照", "設 1,6", "設 1,8", "快照", "設 0,3", "快照", "設 1,9", "查 1,2", "查 3,1"];
const subwayOps = ["進 1,A", "進 2,A", "進 3,B", "出 3,C", "出 1,B", "出 2,B", "平均 A,B", "進 4,A", "出 4,B", "平均 A,B"];
const browserOps = ["去 a", "去 b", "去 c", "去 d", "退 3", "進 2", "退 5", "去 e", "進 2", "退 1"];
const editorOps = ["打 abcdef", "左 4", "打 xy", "刪 1", "打 z", "右 2", "刪 9", "左 3"];

export const stage7c: ProblemAnimation[] = [
  {
    problemId: 470,
    brute: oracleQueries.rand10Discard(rand7Rolls, 3),
    efficient: oracleQueries.rand10Reuse(rand7Rolls, 3),
  },
  {
    problemId: 843,
    brute: oracleQueries.guessInOrder(guessWords, "paddle"),
    efficient: oracleQueries.guessMinimax(guessWords, "paddle"),
  },
  {
    problemId: 981,
    brute: versionedData.timeMapScan(timeMapOps),
    efficient: versionedData.timeMapBinary(timeMapOps),
  },
  {
    problemId: 1095,
    brute: oracleQueries.mountainScan(mountainHeights, 3),
    efficient: oracleQueries.mountainBinary(mountainHeights, 3),
  },
  {
    problemId: 1146,
    brute: versionedData.snapshotCopy(4, snapshotOps),
    efficient: versionedData.snapshotHistory(4, snapshotOps),
  },
  {
    problemId: 1237,
    brute: oracleQueries.solutionsAllPairs(4, 4),
    efficient: oracleQueries.solutionsTwoPointers(4, 4),
  },
  {
    problemId: 1396,
    brute: statefulServices.subwayTripList(subwayOps),
    efficient: statefulServices.subwayRouteTotals(subwayOps),
  },
  {
    problemId: 1472,
    brute: statefulServices.browserStepByStep("home", browserOps),
    efficient: statefulServices.browserJump("home", browserOps),
  },
  {
    problemId: 2296,
    brute: statefulServices.editorOneArray(editorOps),
    efficient: statefulServices.editorTwoStacks(editorOps),
  },
];
