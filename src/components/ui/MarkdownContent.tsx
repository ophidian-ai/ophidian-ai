"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Lightweight markdown renderer for blog post content.
 * Handles headings, bold, links, lists, and paragraphs.
 */
export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  const blocks = parseBlocks(content.trim());

  return (
    <div className={`prose-ophidian ${className}`}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

// ── Block types ──

type BlockNode =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "hr" };

function parseBlocks(raw: string): BlockNode[] {
  const lines = raw.split("\n");
  const blocks: BlockNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Heading 2
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      i++;
      continue;
    }

    // Heading 3
    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      i++;
      continue;
    }

    // Unordered list
    if (/^[-*] /.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*] /, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\. /, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Paragraph — collect consecutive non-empty, non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("## ") &&
      !lines[i].startsWith("### ") &&
      !/^[-*] /.test(lines[i].trim()) &&
      !/^\d+\. /.test(lines[i].trim()) &&
      !/^---+$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", text: paraLines.join(" ") });
    }
  }

  return blocks;
}

// ── Block renderer ──

function Block({ block }: { block: BlockNode }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 className="text-2xl font-display font-bold mt-10 mb-4" style={{ color: "var(--color-on-surface)" }}>
          <InlineMarkdown text={block.text} />
        </h2>
      );
    case "h3":
      return (
        <h3 className="text-xl font-display font-semibold mt-8 mb-3" style={{ color: "var(--color-on-surface)" }}>
          <InlineMarkdown text={block.text} />
        </h3>
      );
    case "paragraph":
      return (
        <p className="text-base leading-relaxed mb-6" style={{ color: "var(--color-on-surface-variant)" }}>
          <InlineMarkdown text={block.text} />
        </p>
      );
    case "ul":
      return (
        <ul className="list-disc list-inside space-y-2 mb-6 ml-2" style={{ color: "var(--color-on-surface-variant)" }}>
          {block.items.map((item, i) => (
            <li key={i} className="text-base leading-relaxed">
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal list-inside space-y-2 mb-6 ml-2" style={{ color: "var(--color-on-surface-variant)" }}>
          {block.items.map((item, i) => (
            <li key={i} className="text-base leading-relaxed">
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ol>
      );
    case "hr":
      return <hr className="my-8 border-t border-surface-border" />;
  }
}

// ── Inline markdown (bold, links, inline code) ──

function InlineMarkdown({ text }: { text: string }): ReactNode {
  // Split text into segments: bold, links, inline code, and plain text
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Link: [text](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    // Inline code: `code`
    const codeMatch = remaining.match(/`([^`]+)`/);

    // Find the earliest match
    const matches = [
      boldMatch ? { type: "bold" as const, match: boldMatch, index: boldMatch.index! } : null,
      linkMatch ? { type: "link" as const, match: linkMatch, index: linkMatch.index! } : null,
      codeMatch ? { type: "code" as const, match: codeMatch, index: codeMatch.index! } : null,
    ].filter(Boolean) as { type: "bold" | "link" | "code"; match: RegExpMatchArray; index: number }[];

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const earliest = matches.sort((a, b) => a.index - b.index)[0];

    // Add text before the match
    if (earliest.index > 0) {
      parts.push(remaining.slice(0, earliest.index));
    }

    if (earliest.type === "bold") {
      parts.push(
        <strong key={key++} className="font-semibold" style={{ color: "var(--color-on-surface)" }}>
          {earliest.match[1]}
        </strong>
      );
      remaining = remaining.slice(earliest.index + earliest.match[0].length);
    } else if (earliest.type === "link") {
      const href = earliest.match[2];
      const isInternal = href.startsWith("/");
      parts.push(
        isInternal ? (
          <Link key={key++} href={href} className="text-primary hover:text-primary-light underline transition-colors">
            {earliest.match[1]}
          </Link>
        ) : (
          <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-light underline transition-colors">
            {earliest.match[1]}
          </a>
        )
      );
      remaining = remaining.slice(earliest.index + earliest.match[0].length);
    } else if (earliest.type === "code") {
      parts.push(
        <code
          key={key++}
          className="rounded px-1.5 py-0.5 text-sm font-mono"
          style={{ backgroundColor: "var(--color-surface-container)", color: "var(--color-primary)" }}
        >
          {earliest.match[1]}
        </code>
      );
      remaining = remaining.slice(earliest.index + earliest.match[0].length);
    }
  }

  return <>{parts}</>;
}

export default MarkdownContent;
