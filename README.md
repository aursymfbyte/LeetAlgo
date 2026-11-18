# LeetAlgo

LeetCode 題解網站，將 156 題分成 8 個階段。每題都有 C#、Python、C、C++ 四種語言的題解和複雜度分析。[瀏覽網站](https://aursymfbyte.github.io/LeetAlgo/)

- 每題提供效能版題解，部分題目另有可讀性版，可比較兩版的複雜度。
- 每題附暴力解與效率解的逐步動畫。
- 首頁可依題號或題名搜尋，也能搜尋題目內文、複雜度說明和程式碼。

## 架構與部署

```text
正式站部署
GitHub Actions（推送到 main 時依變更執行）
├─ 前端 → 測試 → Vite 建置 → GitHub Pages
└─ 後端 → 測試 → .NET 發佈 → MonsterASP.NET

本機執行
Docker Compose   Nginx（8081）──提供前端──▶ 瀏覽器 ──▶ API（8090）──▶ SQL Server
Kubernetes（kind） 瀏覽器 ──▶ Nginx（18081）──/api──▶ API（2 個副本）──▶ SQL Server
```

## 專案目錄

<details>
<summary>前端目錄樹</summary>

```text
frontend/
├─ src/
│  ├─ components/
│  │  ├─ AnimationSection.tsx
│  │  ├─ AnimationViewer.tsx
│  │  ├─ CodeViewer.tsx
│  │  ├─ ContentMatches.test.tsx
│  │  ├─ ContentMatches.tsx
│  │  ├─ Markdown.tsx
│  │  ├─ MarkdownEditor.tsx
│  │  ├─ Pager.tsx
│  │  ├─ ProblemForm.tsx
│  │  ├─ RequireAdmin.tsx
│  │  └─ SiteHeader.tsx
│  ├─ lib/
│  │  ├─ animations/
│  │  │  ├─ animations.test.ts
│  │  │  ├─ index.ts
│  │  │  ├─ stage0.ts
│  │  │  ├─ stage1.ts
│  │  │  ├─ stage2.ts
│  │  │  ├─ stage3.ts
│  │  │  ├─ stage4a.ts
│  │  │  ├─ stage4b.ts
│  │  │  ├─ stage4c.ts
│  │  │  ├─ stage5a.ts
│  │  │  ├─ stage5b.ts
│  │  │  ├─ stage6a.ts
│  │  │  ├─ stage6b.ts
│  │  │  ├─ stage6c.ts
│  │  │  ├─ stage7a.ts
│  │  │  ├─ stage7b.ts
│  │  │  ├─ stage7c.ts
│  │  │  └─ types.ts
│  │  ├─ api.test.ts
│  │  ├─ api.ts
│  │  ├─ auth.test.ts
│  │  ├─ auth.ts
│  │  ├─ catalog.tsx
│  │  ├─ complexity.ts
│  │  ├─ languages.ts
│  │  ├─ useDocumentTitle.ts
│  │  └─ visitor.ts
│  ├─ pages/
│  │  ├─ AdminEditPage.test.tsx
│  │  ├─ AdminEditPage.tsx
│  │  ├─ AdminLoginPage.tsx
│  │  ├─ AdminProblemsPage.tsx
│  │  ├─ AdminTermsPage.tsx
│  │  ├─ AdminVisitsPage.test.tsx
│  │  ├─ AdminVisitsPage.tsx
│  │  ├─ ComparePage.tsx
│  │  ├─ IndexPage.tsx
│  │  ├─ ProblemPage.tsx
│  │  └─ TermsPage.tsx
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ styles.css
├─ .dockerignore
├─ .env.development
├─ .env.production
├─ .gitignore
├─ Dockerfile
├─ index.html
├─ package-lock.json
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```

</details>

<details>
<summary>後端目錄樹</summary>

```text
backend/
├─ LeetAlgo.Api/
│  ├─ Auth/
│  │  ├─ JwtSettings.cs
│  │  └─ TokenService.cs
│  ├─ Controllers/
│  │  ├─ AdminProblemsController.cs
│  │  ├─ AnimationMessagesController.cs
│  │  ├─ AuthController.cs
│  │  ├─ ComparisonsController.cs
│  │  ├─ ProblemsController.cs
│  │  ├─ SearchController.cs
│  │  ├─ StagesController.cs
│  │  ├─ TermsController.cs
│  │  └─ VisitsController.cs
│  ├─ Dtos/
│  │  ├─ AnimationMessageDto.cs
│  │  ├─ ComparisonDto.cs
│  │  ├─ LoginDtos.cs
│  │  ├─ ProblemDetailDto.cs
│  │  ├─ ProblemEditDto.cs
│  │  ├─ ProblemSummaryDto.cs
│  │  ├─ SearchResultDto.cs
│  │  ├─ StageDto.cs
│  │  ├─ TermsDto.cs
│  │  └─ VisitDtos.cs
│  ├─ Properties/
│  │  └─ launchSettings.json
│  ├─ wwwroot/
│  │  ├─ favicon.ico
│  │  └─ robots.txt
│  ├─ appsettings.Development.json
│  ├─ appsettings.json
│  ├─ LeetAlgo.Api.csproj
│  ├─ Program.cs
│  └─ SiteOperations.cs
├─ LeetAlgo.Data/
│  ├─ Migrations/
│  │  ├─ 20261107223818_InitialCreate.cs
│  │  ├─ 20261107223818_InitialCreate.Designer.cs
│  │  ├─ 20261113063140_AddVisits.cs
│  │  ├─ 20261113063140_AddVisits.Designer.cs
│  │  ├─ 20261114002300_AddTerms.cs
│  │  ├─ 20261114002300_AddTerms.Designer.cs
│  │  ├─ 20261115092049_AddAnimationMessages.cs
│  │  ├─ 20261115092049_AddAnimationMessages.Designer.cs
│  │  ├─ 20261118022305_AddProblemRevision.cs
│  │  ├─ 20261118022305_AddProblemRevision.Designer.cs
│  │  ├─ 20261118080041_AddCatalogVersion.cs
│  │  ├─ 20261118080041_AddCatalogVersion.Designer.cs
│  │  └─ LeetAlgoContextModelSnapshot.cs
│  ├─ Models/
│  │  ├─ Admin.cs
│  │  ├─ AnimationMessage.cs
│  │  ├─ CatalogVersion.cs
│  │  ├─ Comparison.cs
│  │  ├─ Problem.cs
│  │  ├─ Solution.cs
│  │  ├─ Stage.cs
│  │  ├─ Terms.cs
│  │  └─ Visit.cs
│  ├─ LeetAlgo.Data.csproj
│  └─ LeetAlgoContext.cs
├─ LeetAlgo.Tests/
│  ├─ AdminProblemsControllerTests.cs
│  ├─ LeetAlgo.Tests.csproj
│  ├─ SearchControllerTests.cs
│  ├─ SiteOperationsTests.cs
│  ├─ SourceDataFolderTests.cs
│  ├─ SqlServerTests.cs
│  └─ TestDatabase.cs
├─ LeetAlgo.Tools/
│  ├─ SourceData/
│  │  ├─ solutions/
│  │  │  ├─ API-設計題與互動式題/
│  │  │  ├─ 階段0-陣列字串雜湊表/
│  │  │  ├─ 階段1-雙指針與滑動視窗/
│  │  │  ├─ 階段2-二分搜尋/
│  │  │  ├─ 階段3-堆疊佇列單調堆疊/
│  │  │  ├─ 階段4-鏈結串列二元樹回溯/
│  │  │  ├─ 階段5-網格圖與圖論/
│  │  │  └─ 階段6-貪心與動態規劃/
│  │  ├─ animation-messages.json
│  │  ├─ problems.json
│  │  └─ terms.md
│  ├─ appsettings.json
│  ├─ LeetAlgo.Tools.csproj
│  ├─ PasswordInput.cs
│  ├─ Program.cs
│  ├─ SourceDataFolder.cs
│  └─ SourceDataRecords.cs
├─ .dockerignore
├─ .gitignore
├─ Dockerfile
├─ dotnet-tools.json
└─ LeetAlgoApi.slnx
```

</details>

## 本機執行

### Docker Compose

在專案根目錄依照 [.env.example](.env.example) 建立 `.env`，設定 `DB_PASSWORD`（至少 8 碼，包含大寫、小寫和數字）及 `JWT_KEY`（至少 32 碼），再執行以下指令。

```sh
docker compose up --build
```

啟動時會套用 migration 並匯入題庫，已有題目就略過匯入。啟動後可開啟[本機網站](http://localhost:8081/) 或 [API](http://localhost:8090/)。

- 建立後台帳號用 `docker compose run --rm -it tools create-admin <帳號>`。
- 停止服務用 `docker compose down`。加上 `-v` 會一併刪除本機資料庫。

### Kubernetes（kind）

在 Windows 啟動 Docker Desktop 的 Linux 容器引擎，備妥 PowerShell 7.3 以上、kubectl 和 kind，從專案根目錄執行以下指令。

```powershell
pwsh -File ./k8s/start.ps1
```

腳本會建立或更新 `leetalgo-local` 叢集。終端機印出網址後即可開啟[本機網站](http://127.0.0.1:18081/)。建立後台帳號可加上 `-AdminName <帳號>`。刪除整個叢集會一併移除資料庫。

## API 路由

<details>
<summary> API 路由表</summary>

| 方法 | 路徑 |
|---|---|
| GET | `/api/stages` |
| GET | `/api/problems` |
| GET | `/api/problems/{id}` |
| GET | `/api/comparisons` |
| GET | `/api/search?keyword={keyword}` |
| GET | `/api/search/v2?keyword={keyword}&stage={stage}` |
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
| DELETE | `/api/animation-messages/{problemId}?version={version}&step={step}` |
| GET | `/` |
| GET | `/health/live` |
| GET | `/health/ready` |

</details>

## 題庫匯出與匯入

後台修改會寫入資料庫。要保留目前的題庫，可用 `LeetAlgo.Tools` 的 `export <空資料夾>` 匯出題目、題解、名詞解釋和動畫說明。建立新資料庫時，可用 `import <資料夾>` 匯回。專案附的題庫放在 [SourceData](backend/LeetAlgo.Tools/SourceData/)。

## 測試與部署

| 範圍 | 執行方式 |
|---|---|
| 前端（Vitest、Testing Library） | 在 `frontend/` 執行 `npm test` |
| 後端（xUnit、Testcontainers） | 啟動 Docker，在專案根目錄執行 `dotnet test backend/LeetAlgo.Tests` |

推送到 `main` 時，GitHub Actions 會依前端或後端的變更執行測試，通過後部署。也可以在 Actions 頁面手動執行。

## 監控與快取

- `/health/live` 檢查 API 能否回應，`/health/ready` 檢查資料庫能否查詢，資料庫無法使用時回傳 503。
- [Monitor LeetAlgo](.github/workflows/monitor-site.yml) 約每 5 分鐘檢查正式網站首頁和 API。失敗後等 30 秒重試，連續兩次失敗就開一張 Issue，恢復時自動關閉。
- 前端遇到未預期的伺服器錯誤時會顯示追蹤碼。本機可用 `docker compose logs api` 找到相同的 `TraceId`。
- 題目與階段清單預設啟用快取，可設定 `CatalogCache__Enabled=false` 關閉。
