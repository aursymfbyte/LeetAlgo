import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CodeViewer, { Codes } from "../components/CodeViewer";
import Markdown from "../components/Markdown";
import Pager from "../components/Pager";
import { getProblem, ProblemDetail } from "../lib/api";
import { useCatalogIfLoaded } from "../lib/catalog";
import { languages } from "../lib/languages";
import { useDocumentTitle } from "../lib/useDocumentTitle";

const AnimationSection = lazy(() => import("../components/AnimationSection"));

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
  const catalog = useCatalogIfLoaded();
  const problemId = Number(useParams().id);
  const [detail, setDetail] = useState<ProblemDetail | null>(null);
  const [error, setError] = useState("");

  const listed = catalog?.problems.find((item) => item.id === problemId);
  const problem = listed ?? detail;

  useDocumentTitle(problem ? `${problem.id}. ${problem.title}` : "");

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    setError("");
    getProblem(problemId)
      .then((result) => {
        if (!cancelled) {
          setDetail(result);
        }
      })
      .catch((loadError: Error) => {
        if (!cancelled) {
          setError(loadError.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [problemId]);

  if (error !== "") {
    return <p className="message">{error}</p>;
  }

  if (problem === null) {
    return <p className="message">載入中…</p>;
  }

  const stageName = catalog?.stages.find((item) => item.code === problem.stage)?.name;
  const twoVersions = detail !== null && Object.keys(detail.readable).length > 0;

  return (
    <>
      <nav className="crumbs">
        <Link to="/">全部題目</Link>
        <span>/</span>
        <span>{problem.stage}{stageName && `：${stageName}`}</span>
      </nav>
      <h1 className="problem-title">
        <span className="problem-number">{problem.id}.</span> {problem.title}
      </h1>
      <p className="problem-meta">
        {detail && <a href={detail.link} target="_blank" rel="noopener">LeetCode 原題 ↗</a>}
        {twoVersions && <span className="badge">兩種寫法</span>}
      </p>

      {!detail && <p className="message">載入中…</p>}

      {detail && (
        <>
          <Markdown className="statement text-card" text={removeAdvancedSection(detail.statement)} />

          <Suspense fallback={null}>
            <AnimationSection problemId={problem.id} />
          </Suspense>

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

      {catalog && <Pager problemId={problemId} />}
    </>
  );
}
