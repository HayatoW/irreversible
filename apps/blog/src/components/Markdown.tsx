import MarkdownRenderer from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

type MarkdownProps = {
  content: string;
  className?: string;
};

export default function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={className}>
      <MarkdownRenderer remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </MarkdownRenderer>
    </div>
  );
}
