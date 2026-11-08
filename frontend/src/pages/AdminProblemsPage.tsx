import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteProblem, ProblemSummary } from "../lib/api";
import { clearToken } from "../lib/auth";
import { useCatalog } from "../lib/catalog";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export default function AdminProblemsPage() {
  const { stages, problems, reload } = useCatalog();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useDocumentTitle("題目管理");

  function logout() {
    clearToken();
    navigate("/admin/login");
  }

  async function remove(problem: ProblemSummary) {
    const confirmed = window.confirm(`確定要刪除「${problem.id}. ${problem.title}」嗎？刪除後無法復原。`);
    if (!confirmed) {
      return;
    }

    setError("");
    try {
      await deleteProblem(problem.id);
      await reload();
    } catch (deleteError) {
      setError((deleteError as Error).message);
    }
  }

  return (
    <>
      <section className="hero admin-hero">
        <h1>題目管理</h1>
        <div className="admin-actions">
          <Link className="primary-button" to="/admin/problems/new">新增題目</Link>
          <button type="button" className="secondary-button" onClick={logout}>登出</button>
        </div>
      </section>

      {error !== "" && <p className="form-error">{error}</p>}

      {stages.map((stage) => (
        <section className="stage" key={stage.code}>
          <h2>
            <span className="stage-tag">{stage.code}</span>
            {stage.name}
          </h2>
          <ul className="admin-list">
            {problems
              .filter((problem) => problem.stage === stage.code)
              .map((problem) => (
                <li key={problem.id}>
                  <span className="number">{problem.id}</span>
                  <Link className="title" to={`/problem/${problem.id}`}>{problem.title}</Link>
                  <Link to={`/admin/problems/${problem.id}/edit`}>編輯</Link>
                  <button type="button" className="link-button danger" onClick={() => remove(problem)}>刪除</button>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </>
  );
}
