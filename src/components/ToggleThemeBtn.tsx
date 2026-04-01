import { useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useUIStore } from "../store/uiStore";

const MAX_OFFSET = 24;

export const ToggleThemeBtn = () => {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === "dark";

  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState(isDark ? MAX_OFFSET : 0);
  const dragState = useRef({ startX: 0, startOffset: 0, hasMoved: false });

  const clamp = (value: number) => Math.max(0, Math.min(MAX_OFFSET, value));

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragState.current = {
      startX: e.clientX,
      startOffset: offset,
      hasMoved: false,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - dragState.current.startX;
    if (Math.abs(delta) > 2) dragState.current.hasMoved = true;
    setOffset(clamp(dragState.current.startOffset + delta));
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const shouldGoRight = dragState.current.hasMoved
      ? offset > MAX_OFFSET / 2
      : !isDark;

    setOffset(shouldGoRight ? MAX_OFFSET : 0);
    if (shouldGoRight !== isDark) toggleTheme();
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`w-14 h-8 rounded-full p-1 relative cursor-pointer select-none transition-colors duration-300 ${
        isDark ? "bg-gray-700" : "bg-gray-300"
      }`}
    >
      <Sun
        size={17}
        className={`absolute left-1.5 top-1/2 -translate-y-1/2 text-orange-500 transition-opacity duration-300 pointer-events-none ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      />

      <Moon
        size={17}
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-600 transition-opacity duration-300 pointer-events-none ${
          isDark ? "opacity-0" : "opacity-100"
        }`}
      />

      <div
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease",
        }}
        className={`w-6 h-6 rounded-full pointer-events-none relative z-10 transition-colors duration-300 ${
          isDark ? "bg-indigo-100" : "bg-slate-600"
        }`}
      />
    </div>
  );
};
