import { FormEvent, useEffect, useState } from "react";
import { Frame, ProblemAnimation, Row } from "../lib/animations/types";
import { AnimationMessage } from "../lib/api";
import { getToken } from "../lib/auth";

type Version = "brute" | "efficient";

type PlayerProps = {
  frames: Frame[];
  edits: AnimationMessage[];
  onSave: (step: number, text: string) => Promise<void>;
  onRestore: (step: number) => Promise<void>;
};

type ViewerProps = {
  animations: ProblemAnimation;
  edits: AnimationMessage[];
  onSave: (message: AnimationMessage) => Promise<void>;
  onRestore: (version: string, step: number) => Promise<void>;
};

const VERSIONS: Version[] = ["brute", "efficient"];

const VERSION_NAMES: Record<Version, string> = {
  brute: "暴力解",
  efficient: "效率解",
};

const STEP_DELAY = 1800;
const END_DELAY = 4000;
const LEVEL_HEIGHT = 84;
const NODE_CENTER = 46;

function cellClass(row: Row, index: number) {
  if (row.answer.includes(index)) {
    return "cell answer";
  }
  if (index >= row.rangeStart && index <= row.rangeEnd) {
    return "cell";
  }
  return "cell outside";
}

function pointersAt(row: Row, index: number) {
  const names = Object.keys(row.pointers);
  return names.filter((name) => row.pointers[name] === index).join(" ");
}

function cellsClass(row: Row) {
  let name = "cells";
  if (row.indexed) {
    name += " indexed";
  }
  if (row.shape === "linked") {
    name += " linked";
  }
  return name;
}

function treeLevel(index: number) {
  return Math.floor(Math.log2(index + 1));
}

function treeLeft(index: number) {
  const slots = 2 ** treeLevel(index);
  const firstIndex = slots - 1;
  const percent = ((index - firstIndex + 0.5) / slots) * 100;
  return `${percent}%`;
}

function treeTop(index: number) {
  return treeLevel(index) * LEVEL_HEIGHT;
}

function TreeView({ row }: { row: Row }) {
  const lastIndex = row.cells.length - 1;
  const levels = treeLevel(lastIndex) + 1;
  const positions = row.cells.map((cell, index) => index);
  const nodes = positions.filter((index) => row.cells[index] !== "");
  const children = nodes.filter((index) => index > 0);

  return (
    <div className="tree" style={{ height: levels * LEVEL_HEIGHT }}>
      <svg className="tree-lines">
        {children.map((index) => {
          const parent = Math.floor((index - 1) / 2);
          return (
            <line
              key={index}
              x1={treeLeft(parent)}
              y1={treeTop(parent) + NODE_CENTER}
              x2={treeLeft(index)}
              y2={treeTop(index) + NODE_CENTER}
            />
          );
        })}
      </svg>
      {nodes.map((index) => (
        <div
          className={`${cellClass(row, index)} tree-node`}
          key={index}
          style={{ left: treeLeft(index), top: treeTop(index) }}
        >
          <span className="cell-pointers">{pointersAt(row, index)}</span>
          <span className="cell-value">{row.cells[index]}</span>
        </div>
      ))}
    </div>
  );
}

function RowView({ row }: { row: Row }) {
  if (row.shape === "tree") {
    return (
      <div className="animation-row tree-row">
        <span className="row-label">{row.label}</span>
        <TreeView row={row} />
      </div>
    );
  }

  return (
    <div className="animation-row">
      <span className="row-label">{row.label}</span>
      <div className={cellsClass(row)}>
        {row.cells.length === 0 && <span className="cells-empty">（空的）</span>}
        {row.cells.map((cell, index) => (
          <div className={cellClass(row, index)} key={index}>
            <span className="cell-pointers">{pointersAt(row, index)}</span>
            <span className="cell-value">{cell}</span>
            {row.indexed && <span className="cell-index">{index}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Player({ frames, edits, onSave, onRestore }: PlayerProps) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const lastStep = frames.length - 1;
  const frame = frames[step];
  const edit = edits.find((item) => item.step === step);
  const message = edit === undefined ? frame.message : edit.text;
  const editText = edit === undefined ? "編輯這一步的說明" : "編輯這一步的說明（已改過）";
  const isAdmin = getToken() !== null;

  useEffect(() => {
    if (!playing) {
      return;
    }

    let delay = STEP_DELAY;
    let nextStep = step + 1;
    if (step === lastStep) {
      delay = END_DELAY;
      nextStep = 0;
    }

    const timer = setTimeout(() => setStep(nextStep), delay);
    return () => clearTimeout(timer);
  }, [playing, step, lastStep]);

  function showStep(newStep: number) {
    setPlaying(false);
    setStep(newStep);
  }

  function startEditing() {
    setPlaying(false);
    setDraft(message);
    setError("");
    setEditing(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await onSave(step, draft);
      setEditing(false);
    } catch (saveError) {
      setError((saveError as Error).message);
    }
  }

  async function restore() {
    setError("");
    try {
      await onRestore(step);
      setEditing(false);
    } catch (restoreError) {
      setError((restoreError as Error).message);
    }
  }

  return (
    <div className="animation-stage">
      {frame.rows.map((row) => (
        <RowView key={row.label} row={row} />
      ))}

      {!editing && <p className="animation-message">{message}</p>}
      {editing && (
        <form className="admin-form message-form" onSubmit={handleSubmit}>
          <textarea
            rows={3}
            maxLength={300}
            required
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          {error !== "" && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="primary-button">儲存</button>
            <button type="button" className="secondary-button" onClick={() => setEditing(false)}>取消</button>
            {edit !== undefined && (
              <button type="button" className="secondary-button" onClick={restore}>還原成原本的說明</button>
            )}
          </div>
        </form>
      )}

      <div className="animation-controls">
        <button type="button" className="primary-button" disabled={editing} onClick={() => setPlaying(!playing)}>
          {playing ? "暫停" : "播放"}
        </button>
        <button type="button" className="secondary-button" disabled={editing || step === 0} onClick={() => showStep(step - 1)}>
          上一步
        </button>
        <button type="button" className="secondary-button" disabled={editing || step === lastStep} onClick={() => showStep(step + 1)}>
          下一步
        </button>
        <span className="step-count">第 {step + 1} / {frames.length} 步</span>
        {isAdmin && !editing && (
          <button type="button" className="link-button" onClick={startEditing}>{editText}</button>
        )}
      </div>
    </div>
  );
}

export default function AnimationViewer({ animations, edits, onSave, onRestore }: ViewerProps) {
  const [version, setVersion] = useState<Version>("brute");
  const versionEdits = edits.filter((item) => item.version === version);

  return (
    <>
      <div className="switch">
        {VERSIONS.map((item) => (
          <button
            key={item}
            type="button"
            className={item === version ? "active" : ""}
            onClick={() => setVersion(item)}
          >
            {VERSION_NAMES[item]}
          </button>
        ))}
      </div>
      <Player
        key={version}
        frames={animations[version]}
        edits={versionEdits}
        onSave={(step, text) => onSave({ version, step, text })}
        onRestore={(step) => onRestore(version, step)}
      />
    </>
  );
}
