"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Volume2,
  Pause,
  Play,
  Square,
  Loader2,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAccessibility } from "@/store/accessibility";
import { useTwin } from "@/store/twin";
import { cn } from "@/lib/utils";

interface VoicePlayerProps {
  text: string;
  label?: string;
  className?: string;
  /** Called when playback completes all chunks */
  onComplete?: () => void;
}

const VOICES = [
  { key: "tongtong", label: "Warm", desc: "Gentle & kind" },
  { key: "xiaochen", label: "Calm", desc: "Steady & clear" },
  { key: "kazi", label: "Clear", desc: "Crisp & standard" },
];

export function VoicePlayer({
  text,
  label = "Listen to this",
  className,
  onComplete,
}: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chunkIdx, setChunkIdx] = useState(0);
  const [chunkTotal, setChunkTotal] = useState(1);
  const [speed, setSpeed] = useState(1.0);
  const [voice, setVoice] = useState("tongtong");
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortedRef = useRef(false);
  const reduced = useReducedMotion();
  const a11y = useAccessibility();
  const calm = a11y.calm;
  const bumpTrait = useTwin((s) => s.bumpTrait);
  const addMemory = useTwin((s) => s.addMemory);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      abortedRef.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playChunk = useCallback(
    async function playChunkFn(idx: number) {
      if (abortedRef.current) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice, speed, chunkIndex: idx }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || "Audio failed");
        }
        const total = Number(res.headers.get("X-Chunk-Total") || "1");
        setChunkTotal(total);

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        // Stop previous audio
        if (audioRef.current) {
          audioRef.current.pause();
          URL.revokeObjectURL(audioRef.current.src);
        }

        const audio = new Audio(url);
        audioRef.current = audio;
        audio.playbackRate = 1.0;

        audio.onended = () => {
          URL.revokeObjectURL(url);
          const next = idx + 1;
          if (next < total && !abortedRef.current) {
            setChunkIdx(next);
            playChunkFn(next);
          } else {
            setIsPlaying(false);
            setIsLoading(false);
            if (onComplete) onComplete();
          }
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          setIsPlaying(false);
          setIsLoading(false);
          setError("Playback hiccup. Try again?");
        };

        await audio.play().catch(() => {
          // Autoplay might be blocked; set state so user can press play
          setIsPlaying(false);
          setIsLoading(false);
        });
        setIsLoading(false);
      } catch (e: any) {
        setIsLoading(false);
        setIsPlaying(false);
        setError(e?.message || "Couldn't generate audio.");
      }
    },
    [text, voice, speed, onComplete]
  );

  const handlePlay = useCallback(() => {
    if (isPlaying) {
      // pause
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    // resume if paused mid-chunk
    if (audioRef.current && audioRef.current.paused && !isLoading) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      return;
    }
    setIsPlaying(true);
    // Twin note: learner chose to listen → auditory engagement
    bumpTrait("visualPreference", -1, "Listened to a lesson aloud (auditory).");
    addMemory({ text: "You listened to a lesson aloud.", kind: "observation" });
    playChunk(chunkIdx);
  }, [isPlaying, isLoading, chunkIdx, playChunk, bumpTrait, addMemory]);

  const handleStop = useCallback(() => {
    abortedRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
    setChunkIdx(0);
    // allow future play
    setTimeout(() => {
      abortedRef.current = false;
    }, 100);
  }, []);

  const progress =
    chunkTotal > 1 ? ((chunkIdx + (isPlaying ? 0.5 : 0)) / chunkTotal) * 100 : isPlaying ? 50 : 0;

  return (
    <div
      className={cn(
        "rounded-2xl border border-primary/20 bg-primary/5 p-4 nt-gradient-sage",
        calm && "saturate-75",
        className
      )}
      role="region"
      aria-label={label}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex size-10 items-center justify-center shrink-0">
          {isPlaying && !reduced && (
            <span className="absolute inset-0 rounded-full bg-primary/20 nt-pulse-ring" />
          )}
          <Button
            size="icon"
            onClick={handlePlay}
            disabled={isLoading}
            className="size-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4 translate-x-0.5" />
            )}
          </Button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="size-3.5 text-primary shrink-0" aria-hidden />
            <span className="text-xs font-medium text-primary">
              {label}
            </span>
            {chunkTotal > 1 && isPlaying && (
              <span className="text-[10px] text-muted-foreground tabular-nums">
                Part {chunkIdx + 1} of {chunkTotal}
              </span>
            )}
          </div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-primary/15 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-amber-glow"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {isPlaying && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleStop}
            className="size-8 shrink-0"
            aria-label="Stop audio"
          >
            <Square className="size-3.5" />
          </Button>
        )}

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowSettings((s) => !s)}
          className="size-8 shrink-0"
          aria-label="Voice settings"
          aria-expanded={showSettings}
        >
          <Gauge className="size-4" />
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-rose-soft-foreground" role="alert">
          {error}
        </p>
      )}

      {showSettings && (
        <motion.div
          initial={reduced ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 pt-3 border-t border-primary/15 space-y-3"
        >
          <div>
            <p className="text-xs font-medium mb-1.5 text-muted-foreground">
              Voice
            </p>
            <div className="flex flex-wrap gap-1.5">
              {VOICES.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setVoice(v.key)}
                  aria-pressed={voice === v.key}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-all",
                    voice === v.key
                      ? "border-primary bg-primary/15 text-primary font-medium"
                      : "hover:bg-accent"
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground">
                Speed
              </p>
              <span className="text-xs font-medium tabular-nums">
                {speed.toFixed(1)}×
              </span>
            </div>
            <Slider
              value={[speed]}
              onValueChange={(v) => setSpeed(v[0])}
              min={0.5}
              max={2.0}
              step={0.1}
              className="mt-1"
              aria-label="Playback speed"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
