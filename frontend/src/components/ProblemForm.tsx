import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ProblemEdit, Stage } from "../lib/api";
import { languages } from "../lib/languages";
import MarkdownEditor from "./MarkdownEditor";

const DIFFICULTIES = ["簡單", "中等", "困難"];

type ProblemFormProps = {
  initial: ProblemEdit;
  isNew: boolean;
  stages: Stage[];
  saving: boolean;
  error: string;
  onSave: (problem: ProblemEdit) => void;
};

export default function ProblemForm({ initial, isNew, stages, saving, error, onSave }: ProblemFormProps) {
  const [problem, setProblem] = useState(initial);
  const comparison = problem.comparison;

  function update(changes: Partial<ProblemEdit>) {
    setProblem({ ...problem, ...changes });
  }

  function setOptimalCode(languageKey: string, code: string) {
    update({ optimal: { ...problem.optimal, [languageKey]: code } });
  }

  function setReadableCode(languageKey: string, code: string) {
    update({ readable: { ...problem.readable, [languageKey]: code } });
  }

  function toggleReadable(languageKey: string, enabled: boolean) {
    const readable = { ...problem.readable };
    if (enabled) {
      readable[languageKey] = problem.optimal[languageKey];
    } else {
      delete readable[languageKey];
    }
    update({ readable });
  }

  function toggleComparison(enabled: boolean) {
    if (enabled) {
      update({ comparison: { readableComplexity: "", optimalComplexity: problem.complexity } });
    } else {
      update({ comparison: null });
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave(problem);
  }

  const idValue = problem.id === 0 ? "" : String(problem.id);
  const saveText = saving ? "儲存中…" : "儲存";

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <fieldset>
        <legend>基本資料</legend>
        <div className="form-row">
          <label className="narrow">
            題號
            <input
              type="number"
              min={1}
              value={idValue}
              disabled={!isNew}
              required
              onChange={(event) => update({ id: Number(event.target.value) })}
            />
          </label>
          <label className="grow">
            題名
            <input value={problem.title} required onChange={(event) => update({ title: event.target.value })} />
          </label>
        </div>
        <div className="form-row">
          <label>
            階段
            <select value={problem.stage} onChange={(event) => update({ stage: event.target.value })}>
              {stages.map((stage) => (
                <option key={stage.code} value={stage.code}>{stage.code}：{stage.name}</option>
              ))}
            </select>
          </label>
          <label>
            難度
            <select value={problem.difficulty} onChange={(event) => update({ difficulty: event.target.value })}>
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </label>
          <label className="grow">
            LeetCode 連結
            <input
              type="url"
              value={problem.link}
              required
              onChange={(event) => update({ link: event.target.value })}
            />
          </label>
        </div>
        <label>
          題目列表上顯示的複雜度
          <input
            value={problem.complexity}
            placeholder="例如：時間 O(n)，空間 O(1)"
            required
            onChange={(event) => update({ complexity: event.target.value })}
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>題目（Markdown）</legend>
        <MarkdownEditor
          rows={14}
          value={problem.statement}
          previewClassName="statement text-card"
          onChange={(statement) => update({ statement })}
        />
      </fieldset>

      <fieldset>
        <legend>效能版題解</legend>
        {languages.map((language) => (
          <label key={language.key}>
            {language.label}
            <textarea
              className="code-input"
              rows={12}
              value={problem.optimal[language.key]}
              required
              onChange={(event) => setOptimalCode(language.key, event.target.value)}
            />
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>可讀性版題解</legend>
        <p className="form-hint">勾選的語言會另外存一份可讀性版；沒勾選的語言，兩個版本顯示相同的程式碼。</p>
        {languages.map((language) => {
          const enabled = language.key in problem.readable;
          return (
            <div key={language.key} className="readable-item">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) => toggleReadable(language.key, event.target.checked)}
                />
                {language.label}
              </label>
              {enabled && (
                <textarea
                  className="code-input"
                  rows={12}
                  value={problem.readable[language.key]}
                  required
                  onChange={(event) => setReadableCode(language.key, event.target.value)}
                />
              )}
            </div>
          );
        })}
      </fieldset>

      <fieldset>
        <legend>兩版比較</legend>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={comparison !== null}
            onChange={(event) => toggleComparison(event.target.checked)}
          />
          列入兩版比較頁
        </label>
        {comparison !== null && (
          <div className="form-row">
            <label className="grow">
              可讀性版的複雜度
              <input
                value={comparison.readableComplexity}
                required
                onChange={(event) => update({ comparison: { ...comparison, readableComplexity: event.target.value } })}
              />
            </label>
            <label className="grow">
              效能的複雜度
              <input
                value={comparison.optimalComplexity}
                required
                onChange={(event) => update({ comparison: { ...comparison, optimalComplexity: event.target.value } })}
              />
            </label>
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend>複雜度說明（Markdown）</legend>
        <MarkdownEditor
          rows={10}
          value={problem.complexityAnalysis}
          previewClassName="text-card"
          onChange={(complexityAnalysis) => update({ complexityAnalysis })}
        />
      </fieldset>

      {error !== "" && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="primary-button" disabled={saving}>{saveText}</button>
        <Link to="/admin">取消</Link>
      </div>
    </form>
  );
}
