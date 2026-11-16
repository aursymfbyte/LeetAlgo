import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { problemAnimations } from "./index";
import { Frame } from "./types";

type ProblemBank = {
  problems: { id: number }[];
};

function problemBankIds() {
  const json = readFileSync("../backend/LeetAlgo.Tools/SourceData/problems.json", "utf8");
  const bank: ProblemBank = JSON.parse(json);
  return bank.problems.map((problem) => problem.id);
}

function hasRepeatedRowLabel(frame: Frame) {
  const labels = frame.rows.map((row) => row.label);
  return new Set(labels).size < labels.length;
}

test("動畫的題號和題庫的題號一致", () => {
  const animationIds = problemAnimations.map((animation) => animation.problemId);

  expect(new Set(animationIds)).toEqual(new Set(problemBankIds()));
});

test("每一題只有一份動畫", () => {
  const problemIds = problemAnimations.map((animation) => animation.problemId);

  expect(new Set(problemIds).size).toBe(problemIds.length);
});

test.each(problemAnimations)("第 $problemId 題的兩版動畫每一步都有說明", ({ brute, efficient }) => {
  for (const frames of [brute, efficient]) {
    expect(frames.length).toBeGreaterThan(0);

    for (const frame of frames) {
      expect(frame.message).not.toBe("");
      expect(hasRepeatedRowLabel(frame)).toBe(false);
    }
  }
});
