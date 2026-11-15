import { useEffect, useState } from "react";
import { problemAnimations } from "../lib/animations";
import { AnimationMessage, deleteAnimationMessage, getAnimationMessages, saveAnimationMessage } from "../lib/api";
import AnimationViewer from "./AnimationViewer";

export default function AnimationSection({ problemId }: { problemId: number }) {
  const animations = problemAnimations.find((item) => item.problemId === problemId);
  const [edits, setEdits] = useState<AnimationMessage[]>([]);

  useEffect(() => {
    let cancelled = false;
    setEdits([]);
    getAnimationMessages(problemId).then((result) => {
      if (!cancelled) {
        setEdits(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [problemId]);

  function withoutEdit(version: string, step: number) {
    return edits.filter((item) => item.version !== version || item.step !== step);
  }

  async function saveEdit(message: AnimationMessage) {
    await saveAnimationMessage(problemId, message);
    setEdits([...withoutEdit(message.version, message.step), message]);
  }

  async function restoreOriginal(version: string, step: number) {
    await deleteAnimationMessage(problemId, version, step);
    setEdits(withoutEdit(version, step));
  }

  if (animations === undefined) {
    return null;
  }

  return (
    <section className="solutions">
      <h2>動畫示範</h2>
      <AnimationViewer
        key={problemId}
        animations={animations}
        edits={edits}
        onSave={saveEdit}
        onRestore={restoreOriginal}
      />
    </section>
  );
}
