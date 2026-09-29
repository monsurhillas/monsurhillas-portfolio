"use client";

import { useEffect, useState } from "react";

// A thin horizontal bar that animates from 0 to `percent` width whenever it
// changes — used for allocation breakdowns (by type, by AMC, ...) so the
// share each row holds reads visually, not just as a number.
export default function PercentBar({
  percent,
  color,
}: {
  percent: number;
  color: string;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(100, percent));
    const id = requestAnimationFrame(() => setWidth(clamped));
    return () => cancelAnimationFrame(id);
  }, [percent]);

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  );
}
