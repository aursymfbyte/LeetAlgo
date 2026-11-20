import { useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import RequireAdmin from "./components/RequireAdmin";
import SiteHeader from "./components/SiteHeader";
import { CatalogProvider, RequireCatalog } from "./lib/catalog";
import AdminEditPage from "./pages/AdminEditPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminProblemsPage from "./pages/AdminProblemsPage";
import AdminTermsPage from "./pages/AdminTermsPage";
import AdminVisitsPage from "./pages/AdminVisitsPage";
import ComparePage from "./pages/ComparePage";
import IndexPage from "./pages/IndexPage";
import ProblemPage from "./pages/ProblemPage";
import TermsPage from "./pages/TermsPage";

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <SiteHeader />
      <main className="wrap">
        <Routes>
          <Route element={<CatalogProvider><Outlet /></CatalogProvider>}>
            <Route path="/problem/:id" element={<ProblemPage />} />
            <Route element={<RequireCatalog />}>
              <Route path="/" element={<IndexPage />} />
            </Route>
          </Route>
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<RequireAdmin><Outlet /></RequireAdmin>}>
            <Route path="terms" element={<AdminTermsPage />} />
            <Route path="visits" element={<AdminVisitsPage />} />
            <Route element={<CatalogProvider><RequireCatalog /></CatalogProvider>}>
              <Route index element={<AdminProblemsPage />} />
              <Route path="problems/new" element={<AdminEditPage key="new" />} />
              <Route path="problems/:id/edit" element={<AdminEditPage key="edit" />} />
            </Route>
          </Route>
          <Route path="*" element={<p className="message">找不到這個頁面。</p>} />
        </Routes>
      </main>
    </>
  );
}
