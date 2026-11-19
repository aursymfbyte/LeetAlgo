import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MarkdownEditor from "../components/MarkdownEditor";
import { getTerms, Terms, updateTerms } from "../lib/api";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export default function AdminTermsPage() {
  const navigate = useNavigate();
  const [terms, setTerms] = useState<Terms | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useDocumentTitle("編輯名詞解釋");

  useEffect(() => {
    getTerms()
      .then(setTerms)
      .catch((loadError) => setError(loadError.message));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!terms) return;
    setSaving(true);
    setError("");
    try {
      await updateTerms(terms);
      navigate("/terms");
    } catch (saveError) {
      setError((saveError as Error).message);
      setSaving(false);
    }
  }

  const saveText = saving ? "儲存中…" : "儲存";

  return (
    <>
      <nav className="crumbs">
        <Link to="/admin">題目管理</Link>
        <span>/</span>
        <span>編輯名詞解釋</span>
      </nav>
      <h1 className="problem-title">編輯名詞解釋</h1>

      {terms === null && error === "" && <p className="message">載入中…</p>}
      {terms === null && error !== "" && <p className="form-error">{error}</p>}

      {terms && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>內容（Markdown）</legend>
            <MarkdownEditor
              rows={30}
              value={terms.content}
              previewClassName="text-card terms"
              onChange={(content) => setTerms({ ...terms, content })}
            />
          </fieldset>

          {error !== "" && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={saving}>{saveText}</button>
            <Link to="/admin">取消</Link>
          </div>
        </form>
      )}
    </>
  );
}
