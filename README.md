# LeetAlgo

LeetCode 題解網站，共 156 題，每題包含 C#、Python、C、C++ 四種語言的題解和複雜度分析。

網站：https://aursymfbyte.github.io/LeetAlgo/

使用技術：
- 前端：React、TypeScript、Vite
- 後端：C#、ASP.NET Core Web API、SQL Server
- 部署：GitHub Pages、MonsterASP.NET

## 架構

```
GitHub Pages ──HTTPS──▶ ASP.NET Core Web API ──▶ SQL Server
```

| 資料夾 | 內容 |
|---|---|
| `frontend/` | React 前端 |
| `backend/LeetAlgo.Api` | Web API |
| `backend/LeetAlgo.Data` | 資料表模型，由 API 和命令列工具共用 |
| `backend/LeetAlgo.Tools` | 命令列工具 |

## 內容

- 依題目的種類分成 8 個階段：陣列與雜湊表、雙指針與滑動視窗、二分搜尋、堆疊與佇列、鏈結串列與二元樹與回溯、圖論、貪心與動態規劃、設計題。
- 每題提供效能版題解，部分題目另有可讀性版，並比較兩版的複雜度。
- 首頁的搜尋除了題號和題名，也會搜尋題目內文、複雜度說明和程式碼。
- 156 題的題目頁都有自動播放的動畫，可以切換暴力解和效率解，比較兩種做法的步驟數。二元樹和堆積畫成樹狀圖，鏈結串列的節點之間有箭頭，設計題用同一串操作示範兩種做法。動畫進到題目頁才載入；管理者登入後可以直接在動畫下方修改每一步的說明文字。

## 前端

```
frontend/src/
├─ main.tsx
├─ App.tsx
├─ styles.css
├─ pages/
│  ├─ IndexPage.tsx
│  ├─ ProblemPage.tsx
│  ├─ ComparePage.tsx
│  ├─ TermsPage.tsx
│  ├─ AdminLoginPage.tsx
│  ├─ AdminProblemsPage.tsx
│  ├─ AdminEditPage.tsx
│  ├─ AdminTermsPage.tsx
│  └─ AdminVisitsPage.tsx
├─ components/
│  ├─ SiteHeader.tsx
│  ├─ AnimationSection.tsx
│  ├─ AnimationViewer.tsx
│  ├─ CodeViewer.tsx
│  ├─ ContentMatches.tsx
│  ├─ Markdown.tsx
│  ├─ MarkdownEditor.tsx
│  ├─ Pager.tsx
│  ├─ ProblemForm.tsx
│  └─ RequireAdmin.tsx
└─ lib/
   ├─ animations/
   │  ├─ index.ts
   │  ├─ types.ts
   │  ├─ stage0.ts
   │  ├─ stage1.ts
   │  ├─ stage2.ts
   │  ├─ stage3.ts
   │  ├─ stage4a.ts
   │  ├─ stage4b.ts
   │  ├─ stage4c.ts
   │  ├─ stage5a.ts
   │  ├─ stage5b.ts
   │  ├─ stage6a.ts
   │  ├─ stage6b.ts
   │  ├─ stage6c.ts
   │  ├─ stage7a.ts
   │  ├─ stage7b.ts
   │  └─ stage7c.ts
   ├─ api.ts
   ├─ auth.ts
   ├─ catalog.tsx
   ├─ complexity.ts
   ├─ languages.ts
   ├─ useDocumentTitle.ts
   └─ visitor.ts
```

## 後端

### 資料庫設計

資料表：Stages、Problems、Solutions、Comparisons、Terms、Admins、Visits、AnimationMessages。

- 題目順序由階段順序和題號決定，新增題目時會自動排到正確位置。
- Solutions 建立唯一索引，避免同一題出現重複的題解。
- Terms 只有一筆資料，存放複雜度名詞解釋頁的 Markdown 內容。
- Visits 記錄每天的訪客，同一個瀏覽器一天只算一次。
- AnimationMessages 存管理者改過的動畫說明文字，一筆對應某一題某個版本的某一步；沒有改過的步驟不會有資料。

### API

| 方法 | 網址 |
|---|---|
| GET | `/api/stages` |
| GET | `/api/problems` |
| GET | `/api/problems/{id}` |
| GET | `/api/comparisons` |
| GET | `/api/search?keyword=` |
| GET | `/api/terms` |
| PUT | `/api/terms` |
| POST | `/api/auth/login` |
| GET | `/api/admin/problems/{id}` |
| POST | `/api/admin/problems` |
| PUT | `/api/admin/problems/{id}` |
| DELETE | `/api/admin/problems/{id}` |
| POST | `/api/visits` |
| GET | `/api/visits` |
| GET | `/api/animation-messages/{problemId}` |
| PUT | `/api/animation-messages/{problemId}` |
| DELETE | `/api/animation-messages/{problemId}?version=&step=` |

## 自動部署

使用 GitHub Actions，前端和後端各有一個流程，只在自己的資料夾有變更時才執行：

- `frontend/` 建置前端並部署到 GitHub Pages。
- `backend/` 發佈 API，並用 Web Deploy 上傳到 MonsterASP.NET。
