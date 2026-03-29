import Image from "next/image";

interface BentoItem {
  src: string;
  alt: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
}

interface BentoGridProps {
  items: BentoItem[];
}

/**
 * Three-column bento grid for case study image mosaic.
 * Grid layout per DESIGN.md §2.6.
 */
export function BentoGrid({ items }: BentoGridProps) {
  if (items.length === 0) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px",
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            gridColumn: item.colSpan ? `span ${item.colSpan}` : "span 1",
            gridRow: item.rowSpan ? `span ${item.rowSpan}` : "span 1",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            background: "var(--color-surface)",
            minHeight: "240px",
            position: "relative",
          }}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ))}
    </div>
  );
}
