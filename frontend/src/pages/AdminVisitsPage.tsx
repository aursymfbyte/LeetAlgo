import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVisitStats, VisitStats } from "../lib/api";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export default function AdminVisitsPage() {
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [error, setError] = useState("");

  useDocumentTitle("造訪統計");

  useEffect(() => {
    getVisitStats()
      .then(setStats)
      .catch((loadError) => setError(loadError.message));
  }, []);

  return (
    <>
      <nav className="crumbs">
        <Link to="/admin">題目管理</Link>
        <span>/</span>
        <span>造訪統計</span>
      </nav>
      <h1 className="problem-title">造訪統計</h1>

      {error !== "" && <p className="form-error">{error}</p>}
      {stats === null && error === "" && <p className="message">載入中…</p>}

      {stats !== null && (
        <>
          <p className="lead">
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
