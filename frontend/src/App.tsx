import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import RequireAdmin from "./components/RequireAdmin";
import SiteHeader from "./components/SiteHeader";
import { CatalogProvider } from "./lib/catalog";
import AdminEditPage from "./pages/AdminEditPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminProblemsPage from "./pages/AdminProblemsPage";
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
        <CatalogProvider>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/problem/:id" element={<ProblemPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<RequireAdmin><AdminProblemsPage /></RequireAdmin>} />
            <Route path="/admin/visits" element={<RequireAdmin><AdminVisitsPage /></RequireAdmin>} />
            <Route path="/admin/problems/new" element={<RequireAdmin><AdminEditPage key="new" /></RequireAdmin>} />
            <Route path="/admin/problems/:id/edit" element={<RequireAdmin><AdminEditPage key="edit" /></RequireAdmin>} />
            <Route path="*" element={<p className="message">找不到這個頁面。</p>} />
          </Routes>
        </CatalogProvider>
      </main>
    </>
  );
}
