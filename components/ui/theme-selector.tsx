"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAccentTheme, type AccentTheme } from "./theme-provider";
import { Moon, Sun, Monitor } from "lucide-react";

interface ThemeOption {
  id: AccentTheme;
  label: string;
  color: string;
  darkColor: string;
}

const themes: ThemeOption[] = [
  { id: "neutral", label: "Neutral", color: "oklch(0.205 0 0)", darkColor: "oklch(0.87 0 0)" },
  { id: "sky", label: "Sky", color: "oklch(0.546 0.245 262.881)", darkColor: "oklch(0.685 0.169 262.881)" },
  { id: "moss", label: "Moss", color: "oklch(0.507 0.179 156.75)", darkColor: "oklch(0.652 0.131 156.75)" },
  { id: "violet", label: "Violet", color: "oklch(0.491 0.27 292.85)", darkColor: "oklch(0.685 0.206 292.85)" },
  { id: "rose", label: "Rose", color: "oklch(0.553 0.237 19.56)", darkColor: "oklch(0.665 0.198 19.56)" },
  { id: "amber", label: "Amber", color: "oklch(0.681 0.204 63.52)", darkColor: "oklch(0.738 0.15 63.52)" },
  { id: "sage", label: "Sage", color: "oklch(0.475 0.091 176.98)", darkColor: "oklch(0.592 0.077 176.98)" },
];

const modeOptions = [
  { id: "light", label: "라이트", icon: Sun },
  { id: "dark", label: "다크", icon: Moon },
  { id: "system", label: "시스템", icon: Monitor },
] as const;

export function ThemeSelector() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { accentTheme, setAccentTheme } = useAccentTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full size-7"
        aria-label="테마 선택"
      >
        <span className="size-3.5 rounded-full border border-border block" />
      </span>
    );
  }

  const currentTheme = themes.find((t) => t.id === accentTheme) ?? themes[0];
  const isDark = resolvedTheme === "dark";

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center justify-center rounded-full size-7 transition-all outline-none",
          "hover:bg-muted"
        )}
        aria-label="테마 선택"
      >
        <span
          className="size-3.5 rounded-full ring-1 ring-foreground/20 block"
          style={{ backgroundColor: isDark ? currentTheme.darkColor : currentTheme.color }}
        />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-56 p-2">
        <div className="mb-2">
          <p className="px-1.5 py-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Accent Color
          </p>
          <div className="grid grid-cols-7 gap-1.5 px-1">
            {themes.map((t) => {
              const isActive = accentTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setAccentTheme(t.id)}
                  className={cn(
                    "flex items-center justify-center size-7 rounded-full transition-all",
                    "hover:scale-110 active:scale-95",
                    isActive && "ring-2 ring-foreground ring-offset-2 ring-offset-popover"
                  )}
                  title={t.label}
                  aria-label={t.label}
                >
                  <span
                    className="size-4 rounded-full block"
                    style={{ backgroundColor: isDark ? t.darkColor : t.color }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-border my-2" />

        <div>
          <p className="px-1.5 py-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Mode
          </p>
          <div className="flex gap-1 px-1">
            {modeOptions.map((mode) => {
              const Icon = mode.icon;
              const isActive = theme === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setTheme(mode.id)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-all",
                    "hover:bg-muted",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
