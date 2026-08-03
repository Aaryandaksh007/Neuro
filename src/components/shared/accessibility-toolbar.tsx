"use client";

import { useState } from "react";
import {
  Accessibility,
  Sun,
  Moon,
  Type,
  Zap,
  Contrast,
  Wind,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { useAccessibility, type FontScale } from "@/store/accessibility";
import { cn } from "@/lib/utils";

const SCALES: { key: FontScale; label: string }[] = [
  { key: "md", label: "A" },
  { key: "lg", label: "A" },
  { key: "xl", label: "A" },
  { key: "xxl", label: "A" },
];

export function AccessibilityToolbar({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const a11y = useAccessibility();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "icon" : "sm"}
          className={cn("gap-2 rounded-full border-border/60 nt-shadow-soft")}
          aria-label="Accessibility & appearance settings"
        >
          <Accessibility className="size-4" />
          {!compact && <span className="hidden sm:inline">Access</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 p-4 rounded-2xl nt-shadow-soft"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold mb-0.5">Make it yours</p>
            <p className="text-xs text-muted-foreground">
              Change anything, anytime. No setting is wrong.
            </p>
          </div>

          <Separator />

          {/* Theme */}
          <Row label="Appearance">
            <div className="flex gap-1">
              <IconToggle
                active={theme !== "dark"}
                onClick={() => setTheme("light")}
                aria-label="Light mode"
              >
                <Sun className="size-4" />
              </IconToggle>
              <IconToggle
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
                aria-label="Dark mode"
              >
                <Moon className="size-4" />
              </IconToggle>
            </div>
          </Row>

          {/* Dyslexia font */}
          <Row
            label="Dyslexia-friendly font"
            hint="OpenDyslexic, wider spacing"
          >
            <Switch
              checked={a11y.font === "dyslexic"}
              onCheckedChange={(v) => a11y.setFont(v ? "dyslexic" : "default")}
              aria-label="Toggle dyslexia-friendly font"
            />
          </Row>

          {/* Font size */}
          <Row label="Text size">
            <div className="flex items-center gap-1">
              {SCALES.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => a11y.setScale(s.key)}
                  aria-label={`Text size ${s.key}`}
                  aria-pressed={a11y.scale === s.key}
                  className={cn(
                    "rounded-md px-2 py-1 transition-colors",
                    a11y.scale === s.key
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  <span
                    className="font-semibold"
                    style={{ fontSize: `${12 + i * 2}px` }}
                  >
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </Row>

          {/* Reduced motion */}
          <Row label="Reduce motion" hint="Calmer for sensitive systems">
            <Switch
              checked={a11y.motion === "reduced"}
              onCheckedChange={(v) => a11y.setMotion(v ? "reduced" : "full")}
              aria-label="Toggle reduced motion"
            />
          </Row>

          {/* High contrast */}
          <Row label="High contrast">
            <Switch
              checked={a11y.contrast === "high"}
              onCheckedChange={(v) => a11y.setContrast(v ? "high" : "standard")}
              aria-label="Toggle high contrast"
            />
          </Row>

          {/* Calm mode */}
          <Row
            label="Calm mode"
            hint="Soften colors & animations"
          >
            <Switch
              checked={a11y.calm}
              onCheckedChange={a11y.setCalm}
              aria-label="Toggle calm mode"
            />
          </Row>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium leading-tight">{label}</p>
        {hint && (
          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
            {hint}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function IconToggle({
  active,
  onClick,
  children,
  "aria-label": label,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  "aria-label": string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "size-8 rounded-md flex items-center justify-center transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted hover:bg-accent"
      )}
    >
      {children}
    </button>
  );
}
