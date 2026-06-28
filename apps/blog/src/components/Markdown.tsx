import { Box } from "@chakra-ui/react";
import MarkdownRenderer from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

type MarkdownProps = {
  content: string;
};

export default function Markdown({ content }: MarkdownProps) {
  return (
    <Box
      css={{
        "& h1, & h2, & h3, & h4, & h5, & h6": {
          fontWeight: "bold",
          marginTop: "1.5em",
          marginBottom: "0.5em",
        },
        "& p": {
          marginBottom: "1em",
          lineHeight: "1.8",
        },
        "& ul, & ol": {
          paddingLeft: "1.5em",
          marginBottom: "1em",
        },
        "& li": {
          marginBottom: "0.25em",
        },
        "& a": {
          color: "var(--chakra-colors-purple-500)",
          textDecoration: "underline",
        },
        "& blockquote": {
          borderLeftWidth: "4px",
          borderLeftColor: "var(--chakra-colors-border-subtle)",
          paddingLeft: "1em",
          marginBottom: "1em",
          fontStyle: "italic",
        },
        "& pre": {
          background: "#1d2e45",
          color: "#e8efff",
          borderRadius: "12px",
          padding: "1em",
          overflowX: "auto",
          marginBottom: "1em",
        },
        "& code": {
          fontSize: "0.9em",
          borderWidth: "1px",
          borderColor: "var(--chakra-colors-border-subtle)",
          borderRadius: "7px",
          padding: "2px 7px",
        },
        "& pre code": {
          border: "none",
          background: "transparent",
          padding: "0",
          borderRadius: "0",
          fontSize: "inherit",
          color: "inherit",
        },
        "& img": {
          maxWidth: "100%",
          borderRadius: "8px",
        },
        "& table": {
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "1em",
        },
        "& th, & td": {
          borderWidth: "1px",
          borderColor: "var(--chakra-colors-border-subtle)",
          padding: "0.5em",
        },
      }}
    >
      <MarkdownRenderer remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </MarkdownRenderer>
    </Box>
  );
}
