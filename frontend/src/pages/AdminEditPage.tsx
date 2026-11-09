import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProblemForm from "../components/ProblemForm";
import { createProblem, getProblemForEdit, ProblemEdit, updateProblem } from "../lib/api";
import { useCatalog } from "../lib/catalog";
import { useDocumentTitle } from "../lib/useDocumentTitle";

function createEmptyProblem(stage: string): ProblemEdit {
  return {
    id: 0,
    title: "",
    stage,
    difficulty: "簡單",
    link: "",
    statement: "",
    complexity: "",
    complexityAnalysis: "",
    optimal: { cs: "", py: "", c: "", cpp: "" },
    readable: {},
    comparison: null,
  };
}

export default function AdminEditPage() {
  const { id } = useParams();
  const isNew = id === undefined;
  const { stages, reload } = useCatalog();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<ProblemEdit | null>(isNew ? createEmptyProblem(stages[0].code) : null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const pageTitle = isNew ? "新增題目" : `編輯第 ${id} 題`;
  useDocumentTitle(pageTitle);

  useEffect(() => {
    if (isNew) {
      return;
    }
    getProblemForEdit(Number(id))
      .then(setProblem)
      .catch((loadError) => setError(loadError.message));
  }, [id, isNew]);

  async function handleSave(edited: ProblemEdit) {
    setSaving(true);
    setError("");
    try {
      if (isNew) {
        await createProblem(edited);
      } else {
        await updateProblem(edited);
      }
      await reload();
      navigate(`/problem/${edited.id}`);
    } catch (saveError) {
      setError((saveError as Error).message);
      setSaving(false);
    }
  }

  return (
    <>
      <nav className="crumbs">
        <Link to="/admin">題目管理</Link>
        <span>/</span>
        <span>{pageTitle}</span>
      </nav>
      <h1 className="problem-title">{pageTitle}</h1>

      {problem === null && error === "" && <p className="message">載入中…</p>}
      {problem === null && error !== "" && <p className="form-error">{error}</p>}

      {problem !== null && (
        <ProblemForm
          initial={problem}
          isNew={isNew}
          stages={stages}
          saving={saving}
          error={error}
          onSave={handleSave}
        />
      )}
    </>
  );
}
