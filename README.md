# LeetAlgo

LeetCode 題解網站，共 156 題，每題包含 C#、Python、C、C++ 四種語言的題解和複雜度分析。

網站：https://aursymfbyte.github.io/LeetAlgo/

使用技術：
- 前端：React、TypeScript、Vite
- 後端：C#、ASP.NET Core Web API、Entity Framework Core、SQL Server
- 測試：Vitest、Testing Library、xUnit、Testcontainers
- 部署：GitHub Actions、GitHub Pages、MonsterASP.NET
- 本機環境：Docker Compose

## 架構

```
GitHub Pages ──HTTPS──▶ ASP.NET Core Web API ──▶ SQL Server
```

| 位置 | 內容 |
|---|---|
| `frontend/` | React 前端 |
| `backend/LeetAlgo.Api` | Web API |
| `backend/LeetAlgo.Data` | 資料表模型與 migration，由 API 和命令列工具共用 |
| `backend/LeetAlgo.Tools` | 命令列工具與題庫匯出檔 |
| `backend/LeetAlgo.Tests` | 後端測試 |
| `docker-compose.yml` | 本機執行環境 |

## 內容

- 依題目的種類分成 8 個階段：陣列與雜湊表、雙指針與滑動視窗、二分搜尋、堆疊與佇列、鏈結串列與二元樹與回溯、圖論、貪心與動態規劃、設計題。
- 每題提供效能版題解，部分題目另有可讀性版，並比較兩版的複雜度。
- 每題附暴力解與效率解的逐步動畫。
- 首頁的搜尋除了題號和題名，也會搜尋題目內文、複雜度說明和程式碼。

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
│  ├─ AdminEditPage.test.tsx
│  ├─ AdminTermsPage.tsx
│  └─ AdminVisitsPage.tsx
├─ components/
│  ├─ SiteHeader.tsx
│  ├─ AnimationSection.tsx
│  ├─ AnimationViewer.tsx
│  ├─ CodeViewer.tsx
│  ├─ ContentMatches.tsx
│  ├─ ContentMatches.test.tsx
│  ├─ Markdown.tsx
│  ├─ MarkdownEditor.tsx
│  ├─ Pager.tsx
│  ├─ ProblemForm.tsx
│  └─ RequireAdmin.tsx
└─ lib/
   ├─ animations/
   │  ├─ index.ts
   │  ├─ types.ts
   │  ├─ animations.test.ts
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
   ├─ auth.test.ts
   ├─ catalog.tsx
   ├─ complexity.ts
   ├─ languages.ts
   ├─ useDocumentTitle.ts
   └─ visitor.ts
```

## 後端

資料表：Stages、Problems、Solutions、Comparisons、Terms、Admins、Visits、AnimationMessages。

API 啟動時自動套用尚未執行的 migration。

### API

| 方法 | 網址 |
|---|---|
| GET | `/api/stages` |
| GET | `/api/problems` |
| GET | `/api/problems/{id}` |
| GET | `/api/comparisons` |
| GET | `/api/search?keyword=` |
| GET | `/api/search/v2?keyword=&stage=` |
| GET | `/api/terms` |
| PUT | `/api/terms` |
| POST | `/api/auth/login` |
| GET | `/api/admin/problems/{id}` |
| POST | `/api/admin/problems` |
| PUT | `/api/admin/problems/{id}` |
| DELETE | `/api/admin/problems/{id}` |
| POST | `/api/visits` |
| GET | `/api/visits` |
| DELETE | `/api/visits` |
| GET | `/api/animation-messages/{problemId}` |
| PUT | `/api/animation-messages/{problemId}` |
| DELETE | `/api/animation-messages/{problemId}?version=&step=` |

管理者可在造訪統計頁清空所有日期的紀錄，累計與每日訪客數會從下一次造訪重新計算。

### 命令列工具

網站內容以資料庫為準，後台的修改只寫入資料庫。`backend/LeetAlgo.Tools/SourceData` 是資料庫內容的匯出檔，用於備份及建立新的資料庫。

| 指令 | 用途 |
|---|---|
| `import <資料夾>` | 把匯出檔匯入資料庫；資料庫已有題目時略過 |
| `export <資料夾>` | 把題目、題解、名詞解釋和動畫說明匯出到空的資料夾 |
| `create-admin <帳號>` | 建立管理者帳號 |

匯出成功的結束碼為 0。目的資料夾已有內容時，工具會保留原有檔案、將原因寫入標準錯誤輸出，並以結束碼 1 結束。

連線字串讀取 `appsettings.json`，可由環境變數 `ConnectionStrings__LeetAlgo` 覆寫。

```bash
dotnet run --project backend/LeetAlgo.Tools -- export <資料夾>
```

匯出檔結構：

| 位置 | 內容 |
|---|---|
| `problems.json` | 階段、題目清單、可讀性版的語言、兩版比較 |
| `solutions/<階段>/<題號-題名>/` | `題目.md`、`複雜度說明.md`、四種語言的效能版題解 |
| `solutions/<階段>/<題號-題名>/可讀性版/` | 可讀性版題解 |
| `terms.md` | 複雜度名詞解釋 |
| `animation-messages.json` | 後台修改過的動畫說明 |

## Docker

`docker-compose.yml` 在本機啟動完整網站。

| 服務 | 內容 | 連接埠 |
|---|---|---|
| `db` | SQL Server 2022，資料存於 volume `db-data` | 不對外開放 |
| `tools` | 套用 migration 並匯入 `SourceData`，完成後結束 | — |
| `api` | Web API | 8090 |
| `web` | 前端，由 Nginx 提供 | 8081 |

啟動順序為 `db` 通過健康檢查、`tools` 執行完成、`api`、`web`。

### Dockerfile

| 檔案 | 階段 | 內容 |
|---|---|---|
| `backend/Dockerfile` | `build` | 以 .NET SDK 發佈 API 和命令列工具 |
| | `tools` | .NET Runtime 映像檔，包含命令列工具，`SourceData` 位於 `/data` |
| | `api` | ASP.NET Core Runtime 映像檔，包含 API |
| `frontend/Dockerfile` | `build` | 建置前端；`VITE_API_URL` ，網站根路徑為 `/` |
| | 最終映像檔 | Nginx 提供建置結果 |

### 設定

`.env` 不納入版本控制，格式見 `.env.example`。

| 變數 | 用途 |
|---|---|
| `DB_PASSWORD` | SQL Server `sa` 帳號的密碼，至少 8 個字元，包含大寫、小寫和數字 |
| `JWT_KEY` | token 的簽章金鑰，至少 32 個字元 |

### 指令

| 指令 | 用途 |
|---|---|
| `docker compose up --build` | 建置並啟動；網站為 http://localhost:8081 ，API 為 http://localhost:8090 |
| `docker compose run --rm -it tools create-admin <帳號>` | 建立管理者帳號 |
| `docker compose down` | 停止並移除容器，保留資料庫資料 |
| `docker compose down -v` | 停止並移除容器和資料庫資料 |

## 測試

| 範圍 | 指令 |
|---|---|
| 前端 | `npm test`（在 `frontend/` 執行） |
| 後端 | `dotnet test backend/LeetAlgo.Tests` |

| 測試 | 驗證內容 |
|---|---|
| `animations.test.ts` | 動畫題號與題庫一致 |
| `AdminEditPage.test.tsx` | 清單更新重試、切換題號、儲存衝突後保留草稿 |
| `AdminVisitsPage.test.tsx` | 取消清空、確認後歸零及失敗重試 |
| `ContentMatches.test.tsx` | 內文搜尋失敗或舊版結果可能不完整時顯示提示 |
| `api.test.ts` | 新舊搜尋 API 相容、階段篩選與錯誤處理 |
| `auth.test.ts` | 格式錯誤的登入 token 視為未登入並清除 |
| `SearchControllerTests` | 階段篩選、結果截斷、舊版搜尋格式 |
| `AdminProblemsControllerTests` | 題解語言檢查 |
| `SourceDataFolderTests` | 匯出檔匯入，以及匯出後再匯入的內容一致 |
| `SqlServerTests` | migration、編輯版本衝突與交易回復、匯出指令結束碼、欄位長度、唯一索引、刪除與連帶刪除、讀取 API 與不分大小寫的搜尋 |

`SqlServerTests` 以 Testcontainers 啟動 SQL Server 容器，執行時需要 Docker；其餘後端測試使用 EF Core 的記憶體資料庫。

## 自動部署

使用 GitHub Actions，前端和後端各有一個流程，推送到 `main` 且自己的資料夾有變更時執行，也可以在 Actions 頁面手動執行。

- 前端：執行測試、建置，部署到 GitHub Pages。
- 後端：在 Linux 執行全部後端測試，通過後在 Windows 發佈 API 。測試失敗時不部署。
