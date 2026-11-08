import hljs from "highlight.js/lib/core";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import python from "highlight.js/lib/languages/python";

hljs.registerLanguage("c", c);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("python", python);

export type Language = {
  key: string;
  label: string;
  highlight: string;
  comment: string;
};

export const languages: Language[] = [
  { key: "cs", label: "C#", highlight: "csharp", comment: "//" },
  { key: "py", label: "Python", highlight: "python", comment: "#" },
  { key: "c", label: "C", highlight: "c", comment: "//" },
  { key: "cpp", label: "C++", highlight: "cpp", comment: "//" },
];

export function highlightCode(code: string, language: Language): string {
  return hljs.highlight(code, { language: language.highlight }).value;
}
