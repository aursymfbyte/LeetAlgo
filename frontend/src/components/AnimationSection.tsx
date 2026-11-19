import { useEffect, useState } from "react";
import { problemAnimations } from "../lib/animations";
import { AnimationMessage, deleteAnimationMessage, getAnimationMessages, saveAnimationMessage } from "../lib/api";
import AnimationViewer from "./AnimationViewer";

export default function AnimationSection({ problemId }: { problemId: number }) {
  const animations = problemAnimations.find((item) => item.problemId === problemId);
  const [edits, setEdits] = useState<AnimationMessage[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!animations) return;
    getAnimationMessages(problemId)
      .then((result) => {
        if (cancelled) return;
        setEdits(result.messages);
        setCanEdit(result.canEdit);
      })
      .catch((error: Error) => {
        if (!cancelled) setLoadError(error.message);
      });
    return () => {
      cancelled = true;
    };
  }, [problemId, animations]);

  async function saveEdit(message: AnimationMessage) {
    const saved = await saveAnimationMessage(problemId, message);
    setEdits((current) => [...current.filter((item) => item.version !== saved.version || item.step !== saved.step), saved]);
  }

  async function restoreOriginal(version: string, step: number, revision: string) {
    await deleteAnimationMessage(problemId, version, step, revision);
    setEdits((current) => current.filter((item) => item.version !== version || item.step !== step));
  }

  if (animations === undefined) {
    return null;
  }

  return (
    <section className="solutions">
      <h2>動畫示範</h2>
      {loadError && <p className="message">目前顯示內建動畫說明。{loadError}</p>}
      <AnimationViewer
        canEdit={canEdit}
        animations={animations}
        edits={edits}
        onSave={saveEdit}
        onRestore={restoreOriginal}
      />
    </section>
  );
}
