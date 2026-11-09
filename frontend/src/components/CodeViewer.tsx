import { useState } from "react";
import { complexityOf, shortComplexity } from "../lib/complexity";
import { highlightCode, languages } from "../lib/languages";

export type Version = "optimal" | "readable";
export type Codes = Record<Version, Record<string, string>>;

const VERSIONS: Version[] = ["optimal", "readable"];

const VERSION_NAMES: Record<Version, string> = {
  optimal: "效能",
  readable: "可讀性",
};

type CodeViewerProps = {
  codes: Codes;
  twoVersions: boolean;
};

export default function CodeViewer({ codes, twoVersions }: CodeViewerProps) {
  const [languageKey, setLanguageKey] = useState(localStorage.getItem("codeLanguage") ?? "cs");
  const [version, setVersion] = useState((localStorage.getItem("codeVersion") ?? "optimal") as Version);
  const [copyText, setCopyText] = useState("複製");

  const activeVersion = twoVersions ? version : "optimal";
  const language = languages.find((item) => item.key === languageKey)!;
  const code = codes[activeVersion][language.key];
  const versionLabel = twoVersions ? `${VERSION_NAMES[activeVersion]} · ` : "";
  const complexity = shortComplexity(complexityOf(code, language.comment));

  function chooseLanguage(key: string) {
    setLanguageKey(key);
    localStorage.setItem("codeLanguage", key);
  }

  function chooseVersion(newVersion: Version) {
    setVersion(newVersion);
    localStorage.setItem("codeVersion", newVersion);
  }

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopyText("已複製");
    setTimeout(() => setCopyText("複製"), 1500);
  }

  return (
    <>
      {twoVersions && (
        <>
          <div className="switch">
            {VERSIONS.map((item) => (
              <button
                key={item}
                type="button"
                className={item === activeVersion ? "active" : ""}
                onClick={() => chooseVersion(item)}
              >
                {VERSION_NAMES[item]}
              </button>
            ))}
          </div>
          <p className="version-note">效能版盡量追求最佳時間／空間複雜度；可讀性版寫法可能比較直觀。</p>
        </>
      )}

      <div className="switch">
        {languages.map((item) => (
          <button
            key={item.key}
            type="button"
            className={item.key === language.key ? "active" : ""}
            onClick={() => chooseLanguage(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="pane">
        <div className="pane-head">
          <span className="pane-label">{versionLabel}{language.label}</span>
          {complexity !== "" && <span className="complexity">{complexity}</span>}
          <button type="button" className="copy" onClick={copyCode}>{copyText}</button>
        </div>
        <pre className="code">
          <code dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }} />
        </pre>
      </div>
    </>
  );
}
