import React from "react";
import {
  Folder,
  Brain,
  Tv,
  Music,
  Palette,
  Briefcase,
  Shield,
  Gamepad2,
  BookOpen,
  Wrench,
} from "lucide-react";

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
    svg: <Folder size={18} />,
  },
  ai: {
    key: "ai",
    label: "AI Tools",
    meaning: "AI assistants, models, automations",
    notes: "Friendly chip/brain motif; avoids robot face clichés.",
    svg: <Brain size={18} />,
  },
  stream: {
    key: "stream",
    label: "Streaming",
    meaning: "Video platforms and OTT subscriptions",
    notes: "Play + frame lines for recognizability.",
    svg: <Tv size={18} />,
  },
  music: {
    key: "music",
    label: "Music",
    meaning: "Audio streaming and music tools",
    notes: "Note head + stem; minimal.",
    svg: <Music size={18} />,
  },
  design: {
    key: "design",
    label: "Design",
    meaning: "Design & creative tools",
    notes: "Compass/pen nib hybrid; avoids generic palette icon.",
    svg: <Palette size={18} />,
  },
  work: {
    key: "work",
    label: "Productivity",
    meaning: "Office suites and work utilities",
    notes: "Briefcase form, softened.",
    svg: <Briefcase size={18} />,
  },
  security: {
    key: "security",
    label: "Security",
    meaning: "Password managers, VPNs, security tools",
    notes: "Shield + keyhole, high recognizability.",
    svg: <Shield size={18} />,
  },
  gaming: {
    key: "gaming",
    label: "Gaming",
    meaning: "Games, game subscriptions",
    notes: "Controller silhouette; minimal.",
    svg: <Gamepad2 size={18} />,
  },
  education: {
    key: "education",
    label: "Education",
    meaning: "Learning platforms",
    notes: "Book + bookmark; calm.",
    svg: <BookOpen size={18} />,
  },
  tools: {
    key: "tools",
    label: "Utilities",
    meaning: "General tools / misc",
    notes: "Wrench; use for catch-all categories.",
    svg: <Wrench size={18} />,
  },
};

const SLUG_TO_KEY: Record<string, string> = {
  ai: "ai",
  stream: "stream",
  music: "music",
  design: "design",
  work: "work",
};

export function getCategoryCover(
  coverKey: string | null | undefined,
  slug?: string | null
): CategoryCoverInfo {
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
