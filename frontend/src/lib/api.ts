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
  revision: string;
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
  revision?: string;
};

export type SearchResult = {
  id: number;
  title: string;
  stage: string;
  place: string;
  snippet: string;
};

export type SearchResponse = {
  results: SearchResult[];
  truncated: boolean | null;
};

export type Terms = {
  content: string;
  revision?: string;
};

export type AnimationMessage = {
  revision?: string;
  version: string;
  step: number;
  text: string;
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
  let response: Response;
  try {
    response = await fetch(API_URL + path, options);
  } catch {
    throw new Error("連不上伺服器，請稍後再試。");
  }
  const traceId = response.headers.get("X-Trace-Id");
  if (response.status >= 500 && traceId) {
    throw new Error(`伺服器暫時無法完成請求。查詢編號 ${traceId}`);
  }
  return response;
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

export async function getProblem(id: number): Promise<ProblemDetail> {
  const response = await request(`/api/problems/${id}`);
  if (response.status === 404) {
    throw new Error("找不到這一題。");
  }
  if (!response.ok) {
    throw new Error("讀取題目失敗，請重新整理頁面。");
  }
  return response.json();
}

export function getComparisons() {
  return getJson<Comparison[]>("/api/comparisons");
}

export async function searchProblems(keyword: string, stage: string): Promise<SearchResponse> {
  const query = new URLSearchParams({ keyword });
  if (stage !== "all") {
    query.set("stage", stage);
  }

  const response = await request(`/api/search/v2?${query}`);
  if (response.status === 404) {
    const oldQuery = new URLSearchParams({ keyword });
    const matches = await getJson<SearchResult[]>(`/api/search?${oldQuery}`);
    const results = stage === "all" ? matches : matches.filter((match) => match.stage === stage);
    return { results, truncated: matches.length >= 50 ? null : false };
  }
  if (!response.ok) {
    throw new Error("內文和程式碼搜尋失敗。");
  }
  return response.json();
}

export function getTerms() {
  return getJson<Terms>("/api/terms");
}

export async function getAnimationMessages(problemId: number) {
  const response = await request(`/api/animation-messages/${problemId}`);
  if (!response.ok) throw new Error("讀取自訂動畫說明失敗。");
  const messages: AnimationMessage[] = await response.json();
  return { messages, canEdit: response.headers.get("X-Animation-Revisions") === "1" };
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

async function sendAdminRequest(method: string, path: string, body?: ProblemEdit | Terms | AnimationMessage) {
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
    if (response.status === 400 && contentType.startsWith("application/problem+json")) {
      const problem = await response.json();
      const messages = Object.values<string[]>(problem.errors ?? {}).flat();
      if (messages.length > 0) {
        throw new Error(messages.join(" "));
      }
    }
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

export async function deleteProblem(id: number, revision: string) {
  if (!revision) {
    throw new Error("清單缺少版本。請重新整理後再確認刪除。");
  }
  await sendAdminRequest("DELETE", `/api/admin/problems/${id}?revision=${encodeURIComponent(revision)}`);
}

export async function updateTerms(terms: Terms) {
  if (!terms.revision) throw new Error("缺少名詞解釋版本。請保留草稿，重新載入後再確認。");
  await sendAdminRequest("PUT", "/api/terms", terms);
}

export async function getVisitStats(): Promise<VisitStats> {
  const response = await sendAdminRequest("GET", "/api/visits");
  return response.json();
}

export async function clearVisitStats() {
  await sendAdminRequest("DELETE", "/api/visits");
}

export async function saveAnimationMessage(problemId: number, message: AnimationMessage) {
  const response = await sendAdminRequest("PUT", `/api/animation-messages/${problemId}`, message);
  const saved: AnimationMessage = await response.json();
  return saved;
}

export async function deleteAnimationMessage(problemId: number, version: string, step: number, revision: string) {
  const query = new URLSearchParams({ version, step: String(step), revision });
  await sendAdminRequest("DELETE", `/api/animation-messages/${problemId}?${query}`);
}
