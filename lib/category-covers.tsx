import React from "react";

export interface CategoryCoverInfo {
  key: string;
  label: string;
  meaning: string;
  notes: string;
  svg: React.ReactNode;
}

export const CATEGORY_COVERS: Record<string, CategoryCoverInfo> = {
  default: {
    key: "default",
    label: "Default",
    meaning: "Generic category",
    notes: "Used when coverKey/slug is missing or invalid.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 7.5c0-1.1.9-2 2-2h3.6c.5 0 1 .2 1.4.6l.8.8c.4.4.9.6 1.4.6H18c1.1 0 2 .9 2 2V17c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V7.5z"/>
        <path d="M7 12.2h10"/>
        <path d="M7 15.2h7"/>
      </svg>
    ),
  },
  ai: {
    key: "ai",
    label: "AI Tools",
    meaning: "AI assistants, models, automations",
    notes: "Friendly chip/brain motif; avoids robot face clichés.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 4.8c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2"/>
        <path d="M8.2 8.2c.9-1.4 2.3-2.2 3.8-2.2s2.9.8 3.8 2.2"/>
        <path d="M7.4 10.2c-.3.8-.4 1.6-.4 2.5 0 3 2.2 5.7 5 5.7s5-2.7 5-5.7c0-.9-.1-1.7-.4-2.5"/>
        <path d="M10 12.1h0.01M14 12.1h0.01"/>
        <path d="M10.2 15.1c.8.7 1.8 1.1 2.8 1.1s2-.4 2.8-1.1"/>
        <path d="M12 20.6v1.6"/>
      </svg>
    ),
  },
  stream: {
    key: "stream",
    label: "Streaming",
    meaning: "Video platforms and OTT subscriptions",
    notes: "Play + frame lines for recognizability.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5.5 7.5c0-1.1.9-2 2-2h9c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2h-9c-1.1 0-2-.9-2-2v-9z"/>
        <path d="M10.7 9.8l4.2 2.4-4.2 2.4V9.8z"/>
        <path d="M8 5.5v-1M12 5.5v-1M16 5.5v-1"/>
      </svg>
    ),
  },
  music: {
    key: "music",
    label: "Music",
    meaning: "Audio streaming and music tools",
    notes: "Note head + stem; minimal.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 5v10.2"/>
        <path d="M14 5c2.4.6 4.2 1 6 1.2v3.1c-2.3-.2-4-.6-6-1.2"/>
        <path d="M9.2 18.4c0 1.2-1.2 2.2-2.6 2.2S4 19.6 4 18.4c0-1.2 1.2-2.2 2.6-2.2s2.6 1 2.6 2.2z"/>
        <path d="M14 15.2c0 1.2-1.2 2.2-2.6 2.2s-2.6-1-2.6-2.2c0-1.2 1.2-2.2 2.6-2.2s2.6 1 2.6 2.2z"/>
      </svg>
    ),
  },
  design: {
    key: "design",
    label: "Design",
    meaning: "Design & creative tools",
    notes: "Compass/pen nib hybrid; avoids generic palette icon.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 4.5l2.6 6.2-2.6 1.3-2.6-1.3L12 4.5z"/>
        <path d="M9.4 10.7l-3.4 6.6c-.4.8.2 1.7 1.1 1.7h10c.9 0 1.5-.9 1.1-1.7l-3.4-6.6"/>
        <path d="M12 12v2.8"/>
      </svg>
    ),
  },
  work: {
    key: "work",
    label: "Productivity",
    meaning: "Office suites and work utilities",
    notes: "Briefcase form, softened.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 7V6.2c0-.9.7-1.7 1.7-1.7h2.6c.9 0 1.7.8 1.7 1.7V7"/>
        <path d="M5.5 9c0-1.1.9-2 2-2h9c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-9c-1.1 0-2-.9-2-2V9z"/>
        <path d="M5.5 12h13"/>
        <path d="M11 11.3h2"/>
      </svg>
    ),
  },
  security: {
    key: "security",
    label: "Security",
    meaning: "Password managers, VPNs, security tools",
    notes: "Shield + keyhole, high recognizability.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 4.5l7 3v4.7c0 4.8-3 7.8-7 9.3-4-1.5-7-4.5-7-9.3V7.5l7-3z"/>
        <path d="M12 11.2a2 2 0 0 1 2 2c0 .8-.4 1.5-1.1 1.8V17h-1.8v-2.0c-.7-.3-1.1-1-1.1-1.8a2 2 0 0 1 2-2z"/>
      </svg>
    ),
  },
  gaming: {
    key: "gaming",
    label: "Gaming",
    meaning: "Games, game subscriptions",
    notes: "Controller silhouette; minimal.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7.4 16.8l-1.8-4.1c-.9-2 0.6-4.2 2.8-4.2h7.2c2.2 0 3.7 2.2 2.8 4.2l-1.8 4.1c-.4.9-1.4 1.3-2.2.9l-1.8-1c-.4-.2-.8-.2-1.2 0l-1.8 1c-.8.4-1.8 0-2.2-.9z"/>
        <path d="M9 12.6h2"/>
        <path d="M10 11.6v2"/>
        <path d="M14.6 12.2h0.01M16.4 13.4h0.01"/>
      </svg>
    ),
  },
  education: {
    key: "education",
    label: "Education",
    meaning: "Learning platforms",
    notes: "Book + bookmark; calm.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 5.8c1.8-.9 4-.9 6 0 2-.9 4.2-.9 6 0v13.4c-1.8-.9-4-.9-6 0-2-.9-4.2-.9-6 0V5.8z"/>
        <path d="M12 5.8v13.4"/>
        <path d="M15.5 9.2v4.4l-1.4-.8-1.4.8V9.2"/>
      </svg>
    ),
  },
  tools: {
    key: "tools",
    label: "Utilities",
    meaning: "General tools / misc",
    notes: "Wrench; use for catch-all categories.",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.6 6.2a4.2 4.2 0 0 0-5.9 5.9l-4.2 4.2a1.4 1.4 0 0 0 2 2l4.2-4.2a4.2 4.2 0 0 0 5.9-5.9l-2 2-2.1-.6-.6-2.1 2-2z"/>
      </svg>
    ),
  },
};

const SLUG_TO_KEY: Record<string, string> = {
  ai: "ai",
  stream: "stream",
  music: "music",
  design: "design",
  work: "work",
};

export function getCategoryCover(coverKey: string | null | undefined, slug?: string | null): CategoryCoverInfo {
  const trimmed = (coverKey ?? "").trim();
  if (trimmed && CATEGORY_COVERS[trimmed]) {
    return CATEGORY_COVERS[trimmed];
  }
  const mapped = slug ? SLUG_TO_KEY[slug] : undefined;
  if (mapped && CATEGORY_COVERS[mapped]) {
    return CATEGORY_COVERS[mapped];
  }
  return CATEGORY_COVERS.default;
}
