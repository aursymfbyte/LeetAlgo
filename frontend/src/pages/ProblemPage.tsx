import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CodeViewer, { Codes } from "../components/CodeViewer";
import Markdown from "../components/Markdown";
import Pager from "../components/Pager";
import { getProblem, hasTwoVersions, ProblemDetail } from "../lib/api";
import { useCatalog } from "../lib/catalog";
import { languages } from "../lib/languages";
import { useDocumentTitle } from "../lib/useDocumentTitle";

function removeAdvancedSection(markdown: string) {
  const kept: string[] = [];
  let skipping = false;
  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) {
      skipping = line.trim() === "## 進階";
    }
    if (!skipping) {
      kept.push(line);
    }
  }
  return kept.join("\n").trim();
}

function codesOf(detail: ProblemDetail) {
  const codes: Codes = { optimal: detail.optimal, readable: {} };
  for (const language of languages) {
    if (language.key in detail.readable) {
      codes.readable[language.key] = detail.readable[language.key];
    } else {
      codes.readable[language.key] = detail.optimal[language.key];
    }
  }
  return codes;
}

export default function ProblemPage() {
  const { stages, problems } = useCatalog();
  const { id } = useParams();
  const index = problems.findIndex((problem) => problem.id === Number(id));
  const problem = problems[index];
  const [detail, setDetail] = useState<ProblemDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useDocumentTitle(problem ? `${problem.id}. ${problem.title}` : "找不到題目");

  useEffect(() => {
    if (problem === undefined) {
      return;
    }
    let cancelled = false;
    setDetail(null);
    setFailed(false);
    getProblem(problem.id)
      .then((result) => {
        if (!cancelled) {
          setDetail(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [problem]);

  if (problem === undefined) {
    return <p className="message">找不到這一題。</p>;
  }

  const stage = stages.find((item) => item.code === problem.stage)!;
  const twoVersions = hasTwoVersions(problem);

  return (
    <>
      <nav className="crumbs">
        <Link to="/">全部題目</Link>
        <span>/</span>
        <span>{stage.code}：{stage.name}</span>
      </nav>
      <h1 className="problem-title">
        <span className="problem-number">{problem.id}.</span> {problem.title}
      </h1>
      <p className="problem-meta">
        {detail && <a href={detail.link} target="_blank" rel="noopener">LeetCode 原題 ↗</a>}
        {twoVersions && <span className="badge">兩種寫法</span>}
      </p>

      {failed && <p className="message">讀取題目失敗，請重新整理頁面。</p>}
      {!detail && !failed && <p className="message">載入中…</p>}

      {detail && (
        <>
          <Markdown className="statement text-card" text={removeAdvancedSection(detail.statement)} />

          <section className="solutions">
            <h2>題解</h2>
            <CodeViewer codes={codesOf(detail)} twoVersions={twoVersions} />
          </section>

          <section className="analysis">
            <h2>複雜度</h2>
            <p className="analysis-help"><Link to="/terms">複雜度相關名詞解釋</Link></p>
            <Markdown className="text-card" text={detail.complexityAnalysis} />
          </section>
        </>
      )}

      <Pager index={index} />
    </>
  );
}
