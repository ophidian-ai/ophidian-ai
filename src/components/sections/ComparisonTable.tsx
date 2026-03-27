"use client";

import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/ui/spotlight-card";

export type CellValue = "yes" | "no" | "partial" | string;

export interface ComparisonRow {
  feature: string;
  values: CellValue[];
}

export interface ComparisonTableProps {
  columns: string[];
  rows: ComparisonRow[];
  /** Which column index to highlight (0-based) */
  highlightColumn?: number;
}

function CellContent({ value }: { value: CellValue }) {
  if (value === "yes") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20">
        <Check className="w-4 h-4 text-primary" />
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20">
        <X className="w-4 h-4 text-red-400" />
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20">
        <Minus className="w-4 h-4 text-yellow-400" />
      </span>
    );
  }
  return <span className="text-sm text-foreground-muted">{value}</span>;
}

export function ComparisonTable({
  columns,
  rows,
  highlightColumn = 0,
}: ComparisonTableProps) {
  return (
    <GlowCard className="glass rounded-2xl border border-primary/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-primary/10">
              <th className="px-6 py-4 text-sm font-medium text-foreground-dim uppercase tracking-wider">
                Feature
              </th>
              {columns.map((col, i) => (
                <th
                  key={col}
                  className={cn(
                    "px-6 py-4 text-sm font-semibold text-center whitespace-nowrap",
                    i === highlightColumn
                      ? "text-primary bg-primary/5"
                      : "text-foreground"
                  )}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={row.feature}
                className={cn(
                  "border-b border-primary/5 transition-colors hover:bg-primary/5",
                  ri % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                )}
              >
                <td className="px-6 py-4 text-sm text-foreground">
                  {row.feature}
                </td>
                {row.values.map((val, vi) => (
                  <td
                    key={vi}
                    className={cn(
                      "px-6 py-4 text-center",
                      vi === highlightColumn && "bg-primary/5"
                    )}
                  >
                    <CellContent value={val} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlowCard>
  );
}

export default ComparisonTable;
