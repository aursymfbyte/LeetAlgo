import { ProblemAnimation } from "./types";
import * as caches from "./dataStructures/caches";
import * as queuesAndLists from "./dataStructures/queuesAndLists";
import * as requestCounters from "./dataStructures/requestCounters";
import * as setsAndMaps from "./dataStructures/setsAndMaps";

const lruOps = ["放 1,1", "放 2,2", "放 3,3", "拿 1", "放 4,4", "拿 2", "放 3,7", "拿 1", "拿 3"];
const randomSetOps = ["加 5", "加 8", "加 3", "加 6", "加 3", "抽位置 2", "刪 8", "刪 9", "刪 5", "抽位置 1"];
const lfuOps = ["放 1,1", "放 2,2", "放 3,3", "拿 1", "放 4,4", "拿 2", "拿 3", "拿 4", "放 5,5", "拿 1"];
const circularQueueOps = ["放 1", "放 2", "放 3", "放 4", "放 5", "取出", "放 5", "看隊尾", "取出", "看隊首"];
const hashSetOps = ["加 3", "加 5", "加 6", "加 9", "有 9", "有 7", "加 5", "刪 5", "有 5", "有 6"];
const hashMapOps = ["放 1,10", "放 3,30", "放 4,40", "放 7,70", "拿 7", "放 3,35", "拿 3", "刪 1", "拿 1", "拿 7"];
const linkedListOps = ["尾加 1", "尾加 2", "尾加 3", "尾加 4", "尾加 5", "拿 3", "插 4,9", "刪 5", "拿 4", "拿 1"];
const pingTimes = [1, 100, 3001, 3002, 5000, 6100, 6200, 9500];
const parkingOps = ["大車", "小車", "中車", "小車", "大車", "大車", "中車", "小車", "小車"];

export const stage7a: ProblemAnimation[] = [
  {
    problemId: 146,
    brute: caches.lruList(3, lruOps),
    efficient: caches.lruLinkedList(3, lruOps),
  },
  {
    problemId: 380,
    brute: setsAndMaps.randomSetList(randomSetOps),
    efficient: setsAndMaps.randomSetHashMap(randomSetOps),
  },
  {
    problemId: 460,
    brute: caches.lfuScan(3, lfuOps),
    efficient: caches.lfuFrequencyLists(3, lfuOps),
  },
  {
    problemId: 622,
    brute: queuesAndLists.circularQueueShift(4, circularQueueOps),
    efficient: queuesAndLists.circularQueueRing(4, circularQueueOps),
  },
  {
    problemId: 705,
    brute: setsAndMaps.hashSetList(hashSetOps),
    efficient: setsAndMaps.hashSetBuckets(hashSetOps),
  },
  {
    problemId: 706,
    brute: setsAndMaps.hashMapList(hashMapOps),
    efficient: setsAndMaps.hashMapBuckets(hashMapOps),
  },
  {
    problemId: 707,
    brute: queuesAndLists.linkedListFromHead(linkedListOps),
    efficient: queuesAndLists.linkedListBothEnds(linkedListOps),
  },
  {
    problemId: 933,
    brute: requestCounters.recentCounterScan(pingTimes),
    efficient: requestCounters.recentCounterQueue(pingTimes),
  },
  {
    problemId: 1603,
    brute: requestCounters.parkingSlots(2, 1, 3, parkingOps),
    efficient: requestCounters.parkingCounters(2, 1, 3, parkingOps),
  },
];
