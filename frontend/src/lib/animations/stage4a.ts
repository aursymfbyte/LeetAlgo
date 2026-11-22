import { ProblemAnimation } from "./types";
import * as listMerging from "./linkedLists/listMerging";
import * as pointerWalks from "./linkedLists/pointerWalks";
import * as reversal from "./linkedLists/reversal";

const addFirst = [5, 6, 9];
const addSecond = [7, 8];
const removeValues = [1, 2, 3, 4, 5];
const mergeFirst = [1, 3, 5];
const mergeSecond = [2, 4, 6, 7];
const groupValues = [1, 2, 3, 4, 5];
const betweenValues = [1, 2, 3, 4, 5];
const cycleValues = [3, 7, 2, 9, 5];
const entryValues = [3, 7, 2, 9, 5, 4];
const reorderValues = [1, 2, 3, 4, 5];
const ownA = [1, 2];
const ownB = [3, 4, 5, 6];
const shared = [8, 9];
const reverseValues = [1, 2, 3, 4, 5];
const middleValues = [1, 2, 3, 4, 5, 6, 7, 8];

export const stage4a: ProblemAnimation[] = [
  {
    problemId: 2,
    brute: listMerging.addAsIntegers(addFirst, addSecond),
    efficient: listMerging.addDigitByDigit(addFirst, addSecond),
  },
  {
    problemId: 19,
    brute: pointerWalks.removeByLength(removeValues, 2),
    efficient: pointerWalks.removeWithGap(removeValues, 2),
  },
  {
    problemId: 21,
    brute: listMerging.mergeByInsert(mergeFirst, mergeSecond),
    efficient: listMerging.mergeByTail(mergeFirst, mergeSecond),
  },
  {
    problemId: 25,
    brute: reversal.reverseGroupsByArray(groupValues, 2),
    efficient: reversal.reverseGroupsInPlace(groupValues, 2),
  },
  {
    problemId: 92,
    brute: reversal.reverseBetweenByArray(betweenValues, 2, 4),
    efficient: reversal.reverseBetweenInPlace(betweenValues, 2, 4),
  },
  {
    problemId: 141,
    brute: pointerWalks.cycleBySeenList(cycleValues, 1, "又走回看過的節點，所以有環。"),
    efficient: pointerWalks.hasCycleFastSlow(cycleValues, 1),
  },
  {
    problemId: 142,
    brute: pointerWalks.cycleBySeenList(entryValues, 2, "第一個重複的節點就是入環點。"),
    efficient: pointerWalks.cycleEntryFastSlow(entryValues, 2),
  },
  {
    problemId: 143,
    brute: reversal.reorderByArray(reorderValues),
    efficient: reversal.reorderInPlace(reorderValues),
  },
  {
    problemId: 160,
    brute: pointerWalks.intersectByRescan(ownA, ownB, shared),
    efficient: pointerWalks.intersectBySwitching(ownA, ownB, shared),
  },
  {
    problemId: 206,
    brute: reversal.reverseByArray(reverseValues),
    efficient: reversal.reverseInPlace(reverseValues),
  },
  {
    problemId: 876,
    brute: pointerWalks.middleByLength(middleValues),
    efficient: pointerWalks.middleFastSlow(middleValues),
  },
];
