import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { searchProblems, SearchResponse } from "../lib/api";

const NO_MATCHES: SearchResponse = { results: [], truncated: false };

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
  const [matches, setMatches] = useState(NO_MATCHES);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (keyword.length < 2) {
      setMatches(NO_MATCHES);
      setFailed(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      searchProblems(keyword, stage)
        .then((found) => {
          if (!cancelled) {
            setMatches(found);
            setFailed(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setMatches(NO_MATCHES);
            setFailed(true);
          }
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword, stage]);

  if (failed) {
    return <p className="message">內文和程式碼的搜尋暫時無法使用，請稍後再試。</p>;
  }

  const { results, truncated } = matches;
  if (results.length === 0 && truncated !== null) {
    return null;
  }

  const countText = truncated ? `只列出前 ${results.length} 題` : `${results.length} 題`;

  return (
    <section className="stage">
      <h2>
        內文和程式碼裡找到的題目
        <span className="count">{countText}</span>
      </h2>
      {truncated === null && <p className="message">舊版搜尋只提供全站前 50 題，可能還有其他符合的題目。</p>}
      <ul className="problem-list">
        {results.map((result) => (
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
