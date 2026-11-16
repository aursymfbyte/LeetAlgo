import { Link } from "react-router-dom";
import { useCatalog } from "../lib/catalog";

type PagerProps = {
  problemId: number;
};

export default function Pager({ problemId }: PagerProps) {
  const { problems } = useCatalog();
  const index = problems.findIndex((problem) => problem.id === problemId);
  const previous = problems[index - 1];
  const next = problems[index + 1];

  return (
    <nav className="pager">
      {previous ? (
        <Link className="previous" to={`/problem/${previous.id}`}>
          <small>上一題</small>
          {previous.id}. {previous.title}
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link className="next" to={`/problem/${next.id}`}>
          <small>下一題</small>
          {next.id}. {next.title}
        </Link>
      )}
    </nav>
  );
}
