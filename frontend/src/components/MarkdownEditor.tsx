import Markdown from "./Markdown";

const SYNTAX_HELP = [
  { syntax: "## 標題", effect: "大標題，### 是小標題" },
  { syntax: "**粗體**", effect: "粗體字" },
  { syntax: "- 項目", effect: "清單，一行一項" },
  { syntax: "`nums`", effect: "行內的程式碼" },
  { syntax: "```", effect: "程式碼區塊，開頭和結尾各放一行" },
  { syntax: "| 甲 | 乙 |", effect: "表格，第二行寫 |---|---|" },
  { syntax: "空一行", effect: "換到下一段" },
];

type MarkdownEditorProps = {
  value: string;
  rows: number;
  previewClassName: string;
  onChange: (value: string) => void;
};

export default function MarkdownEditor({ value, rows, previewClassName, onChange }: MarkdownEditorProps) {
  return (
    <>
      <p className="form-hint">左邊輸入，右邊即時預覽。</p>
      <div className="markdown-editor">
        <textarea rows={rows} value={value} required onChange={(event) => onChange(event.target.value)} />
        <Markdown className={previewClassName} text={value} />
      </div>
      <table className="syntax-help">
        <thead>
          <tr>
            <th>寫法</th>
            <th>效果</th>
          </tr>
        </thead>
        <tbody>
          {SYNTAX_HELP.map((item) => (
            <tr key={item.syntax}>
              <td><code>{item.syntax}</code></td>
              <td>{item.effect}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
