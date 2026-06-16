"use client";

import { useState } from "react";
import { YOUTUBE_CATEGORIES, COUNTRIES } from "@/types/youtube";
import { Globe, Tag, ChevronDown } from "lucide-react";

interface FilterBarProps {
  regionCode: string;
  categoryId: string;
  maxResults: number;
  onRegionChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onMaxResultsChange: (v: number) => void;
}

const RESULT_OPTIONS = [
  { value: 10, label: "TOP 10" },
  { value: 20, label: "TOP 20" },
  { value: 30, label: "TOP 30" },
  { value: 50, label: "TOP 50" },
  { value: 100, label: "TOP 100" },
];

export default function FilterBar({
  regionCode, categoryId, maxResults,
  onRegionChange, onCategoryChange, onMaxResultsChange,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Category chip strip */}
      <div className="flex flex-wrap gap-2">
        {YOUTUBE_CATEGORIES.slice(0, 10).map((c) => (
          <button
            key={c.id}
            onClick={() => onCategoryChange(c.id)}
            className={`chip btn-label-sm ${categoryId === c.id ? "chip-active" : ""}`}
          >
            {c.title}
          </button>
        ))}
        {/* Extra categories in select */}
        {YOUTUBE_CATEGORIES.length > 10 && (
          <div className="relative">
            <select
              value={YOUTUBE_CATEGORIES.slice(10).some(c => c.id === categoryId) ? categoryId : ""}
              onChange={(e) => e.target.value && onCategoryChange(e.target.value)}
              className="chip btn-label-sm appearance-none pr-7 cursor-pointer"
              style={
                YOUTUBE_CATEGORIES.slice(10).some(c => c.id === categoryId)
                  ? { background: "var(--color-ink)", color: "var(--color-on-dark)" }
                  : {}
              }
            >
              <option value="">더보기…</option>
              {YOUTUBE_CATEGORIES.slice(10).map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Country + count row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-[9999px] text-sm font-bold"
          style={{ background: "var(--color-surface-card)", color: "var(--color-ink)" }}>
          <Globe className="w-3.5 h-3.5" style={{ color: "var(--color-primary)" }} />
          <select
            value={regionCode}
            onChange={(e) => onRegionChange(e.target.value)}
            className="appearance-none bg-transparent text-sm font-bold cursor-pointer outline-none"
            style={{ color: "var(--color-ink)" }}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          {RESULT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onMaxResultsChange(value)}
              className={`chip-sm btn-label-sm ${maxResults === value ? "chip-active" : "chip"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
