import { marked } from "marked";

type MarkdownProps = {
  text: string;
  className: string;
};

export default function Markdown({ text, className }: MarkdownProps) {
  const html = marked.parse(text, { async: false });
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
