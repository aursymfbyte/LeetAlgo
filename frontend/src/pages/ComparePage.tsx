import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Comparison, getComparisons } from "../lib/api";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export default function ComparePage() {
  const [comparisons, setComparisons] = useState<Comparison[] | null>(null);
  const [failed, setFailed] = useState(false);

  useDocumentTitle("兩版比較");

  useEffect(() => {
    getComparisons()
      .then(setComparisons)
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return <p className="message">讀取比較資料失敗，請重新整理頁面。</p>;
  }

  if (comparisons === null) {
    return <p className="message">載入中…</p>;
  }

  return (
    <>
      <section className="hero">
        <h1>兩版比較</h1>
        <p className="lead">下面 {comparisons.length} 題在兩版的寫法不同，其餘題目兩版相同。</p>
      </section>

      <div className="table-wrap">
        <table className="compare">
          <thead>
            <tr>
              <th>題號</th>
              <th>題目</th>
              <th>可讀性</th>
              <th>效能</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((row) => (
              <tr key={row.id}>
                <td><Link to={`/problem/${row.id}`}>{row.id}</Link></td>
                <td><Link to={`/problem/${row.id}`}>{row.title}</Link></td>
                <td>{row.readableComplexity}</td>
                <td>{row.optimalComplexity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
