import { useEffect, useState } from "react";
import Markdown from "../components/Markdown";
import { getTerms, Terms } from "../lib/api";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export default function TermsPage() {
  const [terms, setTerms] = useState<Terms | null>(null);
  const [failed, setFailed] = useState(false);

  useDocumentTitle("複雜度名詞解釋");

  useEffect(() => {
    getTerms()
      .then(setTerms)
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return <p className="message">讀取名詞解釋失敗，請重新整理頁面。</p>;
  }

  if (terms === null) {
    return <p className="message">載入中…</p>;
  }

  return (
    <>
      <section className="hero">
        <h1>複雜度名詞解釋</h1>
      </section>

      <Markdown className="text-card terms" text={terms.content} />
    </>
  );
}
