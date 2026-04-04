"use client";

import { useEffect, useRef, useState } from "react";
import { WordFrequency } from "@/lib/types";

interface WordCloudProps {
  words: WordFrequency[];
  onWordClick?: (word: string) => void;
}

export default function WordCloud({ words, onWordClick }: WordCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [placedWords, setPlacedWords] = useState<
    { text: string; value: number; x: number; y: number; fontSize: number; rotation: number; color: string }[]
  >([]);

  useEffect(() => {
    if (!words.length || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const maxVal = Math.max(...words.map((w) => w.value));
    const minVal = Math.min(...words.map((w) => w.value));
    const range = maxVal - minVal || 1;

    const colors = [
      "#89b4fa", "#f5c2e7", "#a6e3a1", "#fab387",
      "#f9e2af", "#94e2d5", "#cba6f7", "#89dceb",
      "#eba0ac", "#b4befe",
    ];

    const sorted = [...words].sort((a, b) => b.value - a.value);

    const placed: typeof placedWords = [];
    const occupiedRects: { x: number; y: number; w: number; h: number }[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const word = sorted[i];
      const normalized = (word.value - minVal) / range;
      const fontSize = 12 + normalized * 32;
      const rotation = Math.random() > 0.7 ? -90 : 0;
      const color = colors[i % colors.length];

      const estWidth = word.text.length * fontSize * 0.6;
      const estHeight = fontSize * 1.4;

      let bestX = width / 2;
      let bestY = height / 2;
      let found = false;

      // Spiral placement
      for (let r = 0; r < Math.max(width, height); r += 4) {
        for (let angle = 0; angle < 360; angle += 15) {
          const rad = (angle * Math.PI) / 180;
          const x = width / 2 + r * Math.cos(rad) - estWidth / 2;
          const y = height / 2 + r * Math.sin(rad) - estHeight / 2;

          if (x < 0 || y < 0 || x + estWidth > width || y + estHeight > height)
            continue;

          const overlaps = occupiedRects.some(
            (rect) =>
              x < rect.x + rect.w &&
              x + estWidth > rect.x &&
              y < rect.y + rect.h &&
              y + estHeight > rect.y
          );

          if (!overlaps) {
            bestX = x;
            bestY = y;
            found = true;
            break;
          }
        }
        if (found) break;
      }

      occupiedRects.push({ x: bestX, y: bestY, w: estWidth, h: estHeight });
      placed.push({
        text: word.text,
        value: word.value,
        x: bestX,
        y: bestY,
        fontSize,
        rotation,
        color,
      });
    }

    setPlacedWords(placed);
  }, [words]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      {placedWords.map((word) => (
        <span
          key={word.text}
          className="absolute cursor-pointer transition-all duration-200 hover:opacity-70 select-none whitespace-nowrap"
          style={{
            left: word.x,
            top: word.y,
            fontSize: word.fontSize,
            color: word.color,
            transform: word.rotation ? `rotate(${word.rotation}deg)` : undefined,
            fontWeight: word.fontSize > 30 ? 700 : 500,
            opacity: 0.6 + (word.fontSize - 12) / 32 * 0.4,
          }}
          onClick={() => onWordClick?.(word.text)}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
}
