import { useState } from "react";
import { Link } from "react-router-dom";
import { hasTwoVersions, ProblemSummary } from "../lib/api";
import { useCatalog } from "../lib/catalog";
import { useDocumentTitle } from "../lib/useDocumentTitle";

function ProblemItem({ problem }: { problem: ProblemSummary }) {
  return (
    <li>
      <Link to={`/problem/${problem.id}`}>
        <span className="number">{problem.id}</span>
        <span className="title">
          {problem.title}
          {hasTwoVersions(problem) && <span className="badge">兩種寫法</span>}
        </span>
        <span className="complexity">{problem.complexity}</span>
      </Link>
    </li>
  );
}

export default function IndexPage() {
  const { stages, problems } = useCatalog();
  const [keyword, setKeyword] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");

  useDocumentTitle("");

  const twoVersionCount = problems.filter(hasTwoVersions).length;
  const searchText = keyword.trim().toLowerCase();

  function matches(problem: ProblemSummary): boolean {
    const stageMatches = selectedStage === "all" || problem.stage === selectedStage;
    const keywordMatches = `${problem.id} ${problem.title}`.toLowerCase().includes(searchText);
    return stageMatches && keywordMatches;
  }

  const stageGroups = stages
    .map((stage) => ({
      stage,
      total: problems.filter((problem) => problem.stage === stage.code).length,
      visible: problems.filter((problem) => problem.stage === stage.code && matches(problem)),
    }))
    .filter((group) => group.visible.length > 0);

  return (
    <>
      <section className="hero">
        <h1>力扣算法題解</h1>
        <p className="lead">
          刷題時整理的筆記，共 {problems.length} 題，依主題分成 {stages.length} 個階段。每題都有 C#、Python、C、C++ 四種語言的題解和複雜度分析。
        </p>
        <p className="lead">
          題解以時間、空間複雜度最佳化為目標；其中 {twoVersionCount} 題另外保留比較直白的寫法，可以在<Link to="/compare">兩版比較</Link>查看。
        </p>
      </section>

      <section className="finder">
        <input
          type="search"
          id="search"
          placeholder="搜尋題號或題名"
          autoComplete="off"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <div className="chips">
          <button
            type="button"
            className={selectedStage === "all" ? "chip active" : "chip"}
            onClick={() => setSelectedStage("all")}
          >
            全部
          </button>
          {stages.map((stage) => (
            <button
              key={stage.code}
              type="button"
              className={stage.code === selectedStage ? "chip active" : "chip"}
              onClick={() => setSelectedStage(stage.code)}
            >
              {stage.code}
            </button>
          ))}
        </div>
        {stageGroups.length === 0 && <p className="empty">找不到符合的題目。</p>}
      </section>

      {stageGroups.map(({ stage, total, visible }) => (
        <section className="stage" key={stage.code}>
          <h2>
            <span className="stage-tag">{stage.code}</span>
            {stage.name}
            <span className="count">{total} 題</span>
          </h2>
          <ul className="problem-list">
            {visible.map((problem) => (
              <ProblemItem key={problem.id} problem={problem} />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
