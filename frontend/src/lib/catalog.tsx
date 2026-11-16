import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { getProblems, getStages, ProblemSummary, Stage } from "./api";

type CatalogData = {
  stages: Stage[];
  problems: ProblemSummary[];
};

type Catalog = CatalogData & {
  reload: () => Promise<void>;
};

type CatalogState = {
  catalog: Catalog | null;
  failed: boolean;
};

const CatalogContext = createContext<CatalogState>({ catalog: null, failed: false });

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

  const catalog = data === null ? null : { ...data, reload };
  return <CatalogContext.Provider value={{ catalog, failed }}>{children}</CatalogContext.Provider>;
}

export function RequireCatalog() {
  const { catalog, failed } = useContext(CatalogContext);

  if (failed) {
    return <p className="message">讀取題目清單失敗，請重新整理頁面。</p>;
  }

  if (catalog === null) {
    return <p className="message">載入中…</p>;
  }

  return <Outlet />;
}

export function useCatalog() {
  return useContext(CatalogContext).catalog!;
}

export function useCatalogIfLoaded() {
  return useContext(CatalogContext).catalog;
}
