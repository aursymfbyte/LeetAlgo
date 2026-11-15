import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { searchProblems, SearchResult } from "../lib/api";

const PLACE_NAMES: Record<string, string> = {
  statement: "題目",
  analysis: "複雜度說明",
  cs: "C# 題解",
  py: "Python 題解",
  c: "C 題解",
  cpp: "C++ 題解",
};

function Snippet({ text, keyword }: { text: string; keyword: string }) {
  const start = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (start < 0) {
    return <>{text}</>;
  }

  const end = start + keyword.length;
  return (
    <>
      {text.slice(0, start)}
      <mark>{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  );
}

type ContentMatchesProps = {
  keyword: string;
  stage: string;
};

export default function ContentMatches({ keyword, stage }: ContentMatchesProps) {
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (keyword.length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      searchProblems(keyword)
        .then((found) => {
          if (!cancelled) {
            setResults(found);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setResults([]);
          }
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword]);

  const visible = results.filter((result) => stage === "all" || result.stage === stage);
  if (visible.length === 0) {
    return null;
  }

  return (
    <section className="stage">
      <h2>
        內文和程式碼裡找到的題目
        <span className="count">{visible.length} 題</span>
      </h2>
      <ul className="problem-list">
        {visible.map((result) => (
          <li key={result.id}>
            <Link to={`/problem/${result.id}`}>
              <span className="number">{result.id}</span>
              <span className="title">
                {result.title}
                <span className="badge">{PLACE_NAMES[result.place]}</span>
              </span>
              <span className="snippet">
                <Snippet text={result.snippet} keyword={keyword} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
