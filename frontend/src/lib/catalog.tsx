import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { getProblems, getStages, ProblemSummary, Stage } from "./api";

type Catalog = {
  stages: Stage[];
  problems: ProblemSummary[];
  reload: () => Promise<void>;
};

type CatalogState = {
  catalog: Catalog | null;
  error: string;
};

const CatalogContext = createContext<CatalogState>({ catalog: null, error: "" });

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function reload() {
      const [stages, problems] = await Promise.all([getStages(signal), getProblems(signal)]);
      if (!signal.aborted) setCatalog({ stages, problems, reload });
    }

    reload().catch((loadError: Error) => {
      if (!signal.aborted) setError(loadError.message);
    });
    return () => controller.abort();
  }, []);

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
