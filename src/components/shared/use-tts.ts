"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Hook for on-demand text-to-speech playback.
 * Calls /api/tts with chunked support for long text.
 * Manages audio element lifecycle + state.
 */
export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeText, setActiveText] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortedRef = useRef(false);
  const chunkIdxRef = useRef(0);

  const cleanup = useCallback(() => {
    abortedRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const stop = useCallback(() => {
    cleanup();
    setIsPlaying(false);
    setIsLoading(false);
    setActiveText(null);
    // Reset for next play
    setTimeout(() => {
      abortedRef.current = false;
    }, 50);
  }, [cleanup]);

  const playChunk = useCallback(
    async (text: string, idx: number, voice: string, speed: number) => {
      if (abortedRef.current) return;
      setIsLoading(true);
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice, speed, chunkIndex: idx }),
        });
        if (!res.ok) throw new Error("TTS failed");

        const total = Number(res.headers.get("X-Chunk-Total") || "1");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        if (audioRef.current) {
          audioRef.current.pause();
          URL.revokeObjectURL(audioRef.current.src);
        }

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(url);
          const next = idx + 1;
          if (next < total && !abortedRef.current) {
            chunkIdxRef.current = next;
            playChunk(text, next, voice, speed);
          } else {
            setIsPlaying(false);
            setIsLoading(false);
            setActiveText(null);
          }
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          setIsPlaying(false);
          setIsLoading(false);
          setActiveText(null);
        };

        await audio.play().catch(() => {
          setIsPlaying(false);
          setIsLoading(false);
        });
        setIsLoading(false);
      } catch {
        setIsPlaying(false);
        setIsLoading(false);
        setActiveText(null);
      }
    },
    []
  );

  const speak = useCallback(
    (text: string, opts?: { voice?: string; speed?: number }) => {
      const voice = opts?.voice || "tongtong";
      const speed = opts?.speed ?? 1.0;
      const clean = text.trim();
      if (!clean) return;

      // If already playing this text, stop
      if (activeText === clean && isPlaying) {
        stop();
        return;
      }

      // Stop any current playback
      cleanup();
      abortedRef.current = false;

      setActiveText(clean);
      setIsPlaying(true);
      chunkIdxRef.current = 0;
      playChunk(clean, 0, voice, speed);
    },
    [activeText, isPlaying, cleanup, stop, playChunk]
  );

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
    activeText,
  };
}
