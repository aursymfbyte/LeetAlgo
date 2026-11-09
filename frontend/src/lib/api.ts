import { clearToken, getToken } from "./auth";

export type Stage = {
  code: string;
  name: string;
};

export type ProblemSummary = {
  id: number;
  title: string;
  stage: string;
  complexity: string;
  readableLanguages: string[];
};

export type ProblemDetail = {
  id: number;
  title: string;
  stage: string;
  difficulty: string;
  link: string;
  statement: string;
  complexity: string;
  complexityAnalysis: string;
  optimal: Record<string, string>;
  readable: Record<string, string>;
};

export type Comparison = {
  id: number;
  title: string;
  readableComplexity: string;
  optimalComplexity: string;
};

export type ComparisonEdit = {
  readableComplexity: string;
  optimalComplexity: string;
};

export type ProblemEdit = {
  id: number;
  title: string;
  stage: string;
  difficulty: string;
  link: string;
  statement: string;
  complexity: string;
  complexityAnalysis: string;
  optimal: Record<string, string>;
  readable: Record<string, string>;
  comparison: ComparisonEdit | null;
};

const API_URL: string = import.meta.env.VITE_API_URL;

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(API_URL + path);
  if (!response.ok) {
    throw new Error(`讀取失敗：${path}`);
  }
  return response.json();
}

export function getStages() {
  return getJson<Stage[]>("/api/stages");
}

export function getProblems() {
  return getJson<ProblemSummary[]>("/api/problems");
}

export function getProblem(id: number) {
  return getJson<ProblemDetail>(`/api/problems/${id}`);
}

export function getComparisons() {
  return getJson<Comparison[]>("/api/comparisons");
}

export function hasTwoVersions(problem: ProblemSummary) {
  return problem.readableLanguages.length > 0;
}

export async function login(userName: string, password: string) {
  const response = await fetch(API_URL + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, password }),
  });

  if (response.status === 401) {
    throw new Error("帳號或密碼錯誤。");
  }
  if (response.status === 429) {
    throw new Error("嘗試次數太多，請一分鐘後再試。");
  }
  if (!response.ok) {
    throw new Error("登入失敗，請稍後再試。");
  }

  const result: { token: string } = await response.json();
  return result.token;
}

async function sendAdminRequest(method: string, path: string, body?: ProblemEdit) {
  const response = await fetch(API_URL + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    clearToken();
    window.location.hash = "#/admin/login";
    throw new Error("登入已過期，請重新登入。");
  }
  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response;
}

export async function getProblemForEdit(id: number): Promise<ProblemEdit> {
  const response = await sendAdminRequest("GET", `/api/admin/problems/${id}`);
  return response.json();
}

export async function createProblem(problem: ProblemEdit) {
  await sendAdminRequest("POST", "/api/admin/problems", problem);
}

export async function updateProblem(problem: ProblemEdit) {
  await sendAdminRequest("PUT", `/api/admin/problems/${problem.id}`, problem);
}

export async function deleteProblem(id: number) {
  await sendAdminRequest("DELETE", `/api/admin/problems/${id}`);
}
