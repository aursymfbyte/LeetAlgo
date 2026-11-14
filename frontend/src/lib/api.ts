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

export type Terms = {
  content: string;
};

export type DailyVisits = {
  date: string;
  visitors: number;
};

export type VisitStats = {
  totalVisitors: number;
  days: DailyVisits[];
};

const API_URL: string = import.meta.env.VITE_API_URL;

async function request(path: string, options?: RequestInit) {
  try {
    return await fetch(API_URL + path, options);
  } catch {
    throw new Error("連不上伺服器，請稍後再試。");
  }
}

async function getJson<T>(path: string): Promise<T> {
  const response = await request(path);
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

export function getTerms() {
  return getJson<Terms>("/api/terms");
}

export function hasTwoVersions(problem: ProblemSummary) {
  return problem.readableLanguages.length > 0;
}

export async function recordVisit(visitorId: string) {
  await fetch(API_URL + "/api/visits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId }),
  });
}

export async function login(userName: string, password: string) {
  const response = await request("/api/auth/login", {
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

async function sendAdminRequest(method: string, path: string, body?: ProblemEdit | Terms) {
  const response = await request(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    const hasUnsavedInput = body !== undefined;
    if (hasUnsavedInput) {
      throw new Error("登入已過期。請開新分頁重新登入，再回到這一頁按儲存。");
    }
    clearToken();
    window.location.hash = "#/admin/login";
    throw new Error("登入已過期，請重新登入。");
  }
  if (!response.ok) {
    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.startsWith("text/plain")) {
      const message = await response.text();
      throw new Error(message);
    }
    throw new Error(`伺服器錯誤（${response.status}），請稍後再試。`);
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

export async function updateTerms(terms: Terms) {
  await sendAdminRequest("PUT", "/api/terms", terms);
}

export async function getVisitStats(): Promise<VisitStats> {
  const response = await sendAdminRequest("GET", "/api/visits");
  return response.json();
}
