import { useEffect, useState } from "react";

/** Returns the current time in milliseconds, updated every `intervalMs` while `enabled`. */
export default function useNow(intervalMs: number, enabled = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, enabled]);
  return now;
}
