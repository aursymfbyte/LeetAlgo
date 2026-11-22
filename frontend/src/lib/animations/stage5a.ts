import { ProblemAnimation } from "./types";
import * as boundaryReachability from "./grids/boundaryReachability";
import * as floodFill from "./grids/floodFill";
import * as gridDistances from "./grids/gridDistances";

const board = [
  ["X", "X", "X", "X", "O", "X"],
  ["X", "O", "O", "X", "O", "X"],
  ["X", "O", "O", "O", "X", "O"],
  ["X", "X", "X", "X", "X", "X"],
];
const islandGrid = [
  ["水", "陸", "水", "水"],
  ["陸", "陸", "水", "陸"],
  ["水", "水", "水", "陸"],
];
const oceanHeights = [
  [1, 2, 2, 3],
  [3, 2, 3, 4],
  [2, 4, 5, 3],
];
const areaGrid = [
  ["水", "水", "陸", "水"],
  ["陸", "陸", "陸", "水"],
  ["水", "水", "水", "陸"],
];
const image = [
  [1, 1, 1],
  [1, 1, 0],
  [1, 0, 1],
];
const oranges = [
  ["爛", "鮮", "鮮"],
  ["鮮", "鮮", "空"],
  ["空", "鮮", "鮮"],
];
const maze = [
  ["牆", "牆", "牆", "牆", "牆"],
  ["路", "路", "路", "路", "牆"],
  ["牆", "路", "路", "路", "牆"],
  ["牆", "牆", "牆", "路", "牆"],
];

export const stage5a: ProblemAnimation[] = [
  {
    problemId: 130,
    brute: boundaryReachability.surroundedBrute(board),
    efficient: boundaryReachability.surroundedFromEdge(board),
  },
  {
    problemId: 200,
    brute: floodFill.islandsBrute(islandGrid),
    efficient: floodFill.islandsSink(islandGrid),
  },
  {
    problemId: 417,
    brute: boundaryReachability.oceansBrute(oceanHeights),
    efficient: boundaryReachability.oceansClimb(oceanHeights),
  },
  {
    problemId: 695,
    brute: floodFill.maxAreaBrute(areaGrid),
    efficient: floodFill.maxAreaSink(areaGrid),
  },
  {
    problemId: 733,
    brute: floodFill.fillBrute(image, 1, 1, 2),
    efficient: floodFill.fillSpread(image, 1, 1, 2),
  },
  {
    problemId: 994,
    brute: gridDistances.orangesBrute(oranges),
    efficient: gridDistances.orangesQueue(oranges),
  },
  {
    problemId: 1926,
    brute: gridDistances.exitBrute(maze, 1, 0),
    efficient: gridDistances.exitQueue(maze, 1, 0),
  },
];
