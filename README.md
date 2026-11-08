# LeetAlgo

LeetCode 題解網站，共 156 題，每題包含 C#、Python、C、C++ 四種語言的題解和複雜度分析。

網站：https://aursymfbyte.github.io/LeetAlgo/

使用技術：
- 前端：React、TypeScript、Vite
- 後端：C#、ASP.NET Web API、SQL Server
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

## 前端

```
frontend/src/
├─ main.tsx              進入點，設定路由
├─ App.tsx               頁面路由
├─ styles.css
├─ pages/
│  ├─ IndexPage.tsx      題目列表、搜尋、依階段篩選
│  ├─ ProblemPage.tsx   
│  ├─ ComparePage.tsx    
│  ├─ TermsPage.tsx      
│  ├─ AdminLoginPage.tsx 
│  ├─ AdminProblemsPage.tsx 
│  └─ AdminEditPage.tsx  
├─ components/
│  ├─ SiteHeader.tsx
│  ├─ CodeViewer.tsx     
│  ├─ Markdown.tsx      
│  ├─ Pager.tsx         
│  ├─ ProblemForm.tsx    
│  └─ RequireAdmin.tsx  
└─ lib/
   ├─ api.ts             呼叫後端 API 的函式和資料型別
   ├─ auth.ts            
   ├─ catalog.tsx        
   └─ ...                語言設定、複雜度標示、題目內容處理等函式
```

## 後端

### 資料庫設計

| 資料表 |
|---|
| Stages |
| Problems |
| Solutions |
| Comparisons |
| Admins |

- 題目順序由階段順序和題號決定，會自動排序正確順序。
- Solutions 建立唯一索引，避免同一題出現重複的題解。

### API

| 方法 | 網址 |
|---|---|
| GET | `/api/stages` |
| GET | `/api/problems` |
| GET | `/api/problems/{id}` |
| GET | `/api/comparisons` |
| POST | `/api/auth/login` |
| GET | `/api/admin/problems/{id}` |
| POST | `/api/admin/problems` |
| PUT | `/api/admin/problems/{id}` |
| DELETE | `/api/admin/problems/{id}` |

## 自動部署

只在自己的資料夾有變更時才執行：

- `frontend/` 建置前端並部署到 GitHub Pages。
- `backend/` 發佈 API，並用 Web Deploy 上傳到 MonsterASP.NET。
