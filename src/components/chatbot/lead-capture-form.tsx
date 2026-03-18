"use client";

import { useState } from "react";
import type { LeadCaptureMode } from "@/lib/supabase/chatbot-types";

interface LeadCaptureFormProps {
  fields: string[];
  mode: LeadCaptureMode;
  primaryColor: string;
  onSubmit: (data: { name?: string; email?: string; phone?: string }) => void;
  onDismiss?: () => void;
}

export function LeadCaptureForm({ fields, mode, primaryColor, onSubmit, onDismiss }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const isOverlay = mode === "message_count";

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name: formData.name || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
    });
  }

  const fieldConfigs: Record<string, { label: string; type: string; placeholder: string }> = {
    name: { label: "Name", type: "text", placeholder: "Your name" },
    email: { label: "Email", type: "email", placeholder: "your@email.com" },
    phone: { label: "Phone", type: "tel", placeholder: "(555) 000-0000" },
  };

  const formContent = (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 600, color: "#111827" }}>
        Before we continue, can we get your info?
      </p>
      {fields.map((field) => {
        const config = fieldConfigs[field];
        if (!config) return null;
        return (
          <div key={field} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label
              htmlFor={`lcf-${field}`}
              style={{ fontSize: "12px", fontWeight: 500, color: "#374151" }}
            >
              {config.label}
            </label>
            <input
              id={`lcf-${field}`}
              type={config.type}
              placeholder={config.placeholder}
              value={formData[field] || ""}
              onChange={(e) => handleChange(field, e.target.value)}
              style={{
                padding: "8px 10px",
                fontSize: "14px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                outline: "none",
                color: "#111827",
                background: "#fff",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </div>
        );
      })}
      <button
        type="submit"
        style={{
          marginTop: "4px",
          padding: "9px 16px",
          fontSize: "14px",
          fontWeight: 600,
          color: "#fff",
          background: primaryColor,
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Continue
      </button>
      {isOverlay && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            padding: "6px",
            fontSize: "12px",
            color: "#6b7280",
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          No thanks
        </button>
      )}
    </form>
  );

  if (isOverlay) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            width: "100%",
            maxWidth: "340px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          }}
        >
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        borderTop: "1px solid #e5e7eb",
        padding: "16px",
        background: "#f9fafb",
      }}
    >
      {formContent}
    </div>
  );
}
