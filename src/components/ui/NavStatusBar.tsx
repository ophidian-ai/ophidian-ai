"use client";

import { useEffect, useState } from "react";

function useLocalTime(timezone = "America/Indiana/Indianapolis") {
  const [time, setTime] = useState("");

  useEffect(() => {
    function update() {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: timezone,
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  return time;
}

export function NavStatusBar() {
  const time = useLocalTime();

  return (
    <div className="flex items-center gap-6 text-xs text-foreground/40 tracking-wide">
      {/* Available pill */}
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
        </span>
        <span className="text-foreground/60">Available for new clients</span>
      </span>

      {/* Live time */}
      {time && (
        <span className="hidden md:block">
          Columbus, IN · {time} ET
        </span>
      )}
    </div>
  );
}
