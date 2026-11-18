import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { clearVisitStats, getVisitStats, VisitStats } from "../lib/api";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export default function AdminVisitsPage() {
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [error, setError] = useState("");
  const [clearing, setClearing] = useState(false);

  useDocumentTitle("造訪統計");

  useEffect(() => {
    let active = true;
    getVisitStats()
      .then((loaded) => {
        if (active) setStats(loaded);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      });
    return () => { active = false; };
  }, []);

  async function handleClear() {
    if (!window.confirm("確定要清空全部造訪紀錄嗎？累計訪客數與每日統計都會歸零，清空後無法復原。")) {
      return;
    }

    setClearing(true);
    setError("");
    try {
      await clearVisitStats();
      setStats({ totalVisitors: 0, days: [] });
    } catch (clearError) {
      setError((clearError as Error).message);
    } finally {
      setClearing(false);
    }
  }

  return (
    <>
      <nav className="crumbs">
        <Link to="/admin">題目管理</Link>
        <span>/</span>
        <span>造訪統計</span>
      </nav>
      <div className="admin-hero">
        <h1 className="problem-title">造訪統計</h1>
        {stats !== null && (
          <button
            type="button"
            className="secondary-button danger"
            disabled={clearing || stats.totalVisitors === 0}
            onClick={handleClear}
          >
            {clearing ? "清空中…" : "清空流量統計"}
          </button>
        )}
      </div>

      {error !== "" && <p className="form-error" role="alert">{error}</p>}
      {stats === null && error === "" && <p className="message">載入中…</p>}

      {stats !== null && (
        <>
          <p className="lead" role="status">
            累計 {stats.totalVisitors} 位訪客。同一個瀏覽器一天只算一次，登入管理者的瀏覽器不計入。
          </p>
          <div className="table-wrap">
            <table className="compare">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>訪客數</th>
                </tr>
              </thead>
              <tbody>
                {stats.days.map((day) => (
                  <tr key={day.date}>
                    <td>{day.date}</td>
                    <td>{day.visitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
