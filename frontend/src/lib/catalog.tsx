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
  error: string;
};

const CatalogContext = createContext<CatalogState>({ catalog: null, error: "" });

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CatalogData | null>(null);
  const [error, setError] = useState("");

  async function reload() {
    const [stages, problems] = await Promise.all([getStages(), getProblems()]);
    setData({ stages, problems });
    setError("");
  }

  async function loadWithRetry() {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await reload();
        return;
      } catch (loadError) {
        if (attempt === 3) {
          setError((loadError as Error).message);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  useEffect(() => {
    loadWithRetry();
  }, []);

  const catalog = data === null ? null : { ...data, reload };
  return <CatalogContext.Provider value={{ catalog, error }}>{children}</CatalogContext.Provider>;
}

export function RequireCatalog() {
  const { catalog, error } = useContext(CatalogContext);

  if (error) {
    return <p className="message">讀取題目清單失敗。{error}</p>;
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
