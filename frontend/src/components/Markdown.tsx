import DOMPurify from "dompurify";
import { marked } from "marked";

type MarkdownProps = {
  text: string;
  className: string;
};

export default function Markdown({ text, className }: MarkdownProps) {
  const unsafeHtml = marked.parse(text, { async: false });
  const html = DOMPurify.sanitize(unsafeHtml);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
