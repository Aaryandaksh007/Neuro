"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccessibility } from "@/store/accessibility";
import { useReducedMotion } from "framer-motion";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
  /** Size of the button */
  size?: "sm" | "md" | "lg";
  /** Label for screen readers */
  label?: string;
  /** Whether to append to existing text or replace */
  mode?: "append" | "replace";
  /** Current value (for append mode) */
  currentValue?: string;
}

export function VoiceInput({
  onTranscript,
  className,
  size = "md",
  label = "Speak instead of typing",
  mode = "append",
  currentValue = "",
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const a11y = useAccessibility();
  const reduced = useReducedMotion() || a11y.motion === "reduced";

  const sizeClass = {
    sm: "size-8",
    md: "size-10",
    lg: "size-12",
  }[size];

  const iconSize = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-5",
  }[size];

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
    chunksRef.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Voice input isn't available in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        cleanup();

        if (blob.size < 500) {
          setError("That was too short — try speaking a bit longer.");
          return;
        }

        setIsTranscribing(true);
        try {
          // Convert to base64
          const arrayBuffer = await blob.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(arrayBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );

          const res = await fetch("/api/asr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio: base64 }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Transcription failed");

          const text = data.text as string;
          if (text) {
            const final =
              mode === "append" && currentValue
                ? currentValue.replace(/\s*$/, "") + " " + text
                : text;
            onTranscript(final);
          }
        } catch (e: any) {
          setError(e?.message || "Couldn't transcribe that.");
        } finally {
          setIsTranscribing(false);
        }
      };

      mr.start();
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          // Auto-stop after 30s to avoid huge payloads
          if (s >= 30) {
            stopRecording();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch (e: any) {
      if (e?.name === "NotAllowedError") {
        setError("Microphone permission needed. You can type instead — that's okay too.");
      } else {
        setError("Couldn't access the microphone.");
      }
      cleanup();
    }
  }, [cleanup, mode, currentValue, onTranscript]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isTranscribing) {
      startRecording();
    }
  };

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        disabled={isTranscribing}
        aria-label={isRecording ? "Stop recording" : label}
        aria-pressed={isRecording}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full transition-all shrink-0",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60",
          "disabled:opacity-50 disabled:pointer-events-none",
          sizeClass,
          isRecording
            ? "bg-rose-soft text-rose-soft-foreground"
            : "bg-muted hover:bg-accent text-muted-foreground hover:text-foreground",
          className
        )}
      >
        {isRecording && !reduced && (
          <span className="absolute inset-0 rounded-full bg-rose-soft/40 nt-pulse-ring" />
        )}
        {isTranscribing ? (
          <Loader2 className={cn("animate-spin", iconSize)} />
        ) : isRecording ? (
          <Square className={cn(iconSize, "fill-current")} />
        ) : (
          <Mic className={iconSize} />
        )}
      </button>

      {isRecording && (
        <span
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium tabular-nums text-rose-soft-foreground whitespace-nowrap"
          aria-live="polite"
        >
          {seconds}s · tap to stop
        </span>
      )}

      {error && (
        <span
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-rose-soft-foreground whitespace-nowrap"
          role="alert"
        >
          {error.length > 40 ? error.slice(0, 38) + "…" : error}
        </span>
      )}
    </div>
  );
}
