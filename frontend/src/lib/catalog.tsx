import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { getProblems, getStages, ProblemSummary, Stage } from "./api";

type CatalogData = {
  stages: Stage[];
  problems: ProblemSummary[];
};

type Catalog = CatalogData & {
  reload: () => Promise<void>;
};

const CatalogContext = createContext<Catalog | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CatalogData | null>(null);
  const [failed, setFailed] = useState(false);

  async function reload() {
    const [stages, problems] = await Promise.all([getStages(), getProblems()]);
    setData({ stages, problems });
  }

  async function loadWithRetry() {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await reload();
        return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
    setFailed(true);
  }

  useEffect(() => {
    loadWithRetry();
  }, []);

  if (failed) {
    return <p className="message">讀取題目清單失敗，請重新整理頁面。</p>;
  }

  if (data === null) {
    return <p className="message">載入中…</p>;
  }

  const catalog: Catalog = { stages: data.stages, problems: data.problems, reload };
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext)!;
}
