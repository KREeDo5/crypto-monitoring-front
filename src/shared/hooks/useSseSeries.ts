import { useEffect, useRef, useState } from "react";
import type { Point, SseChartEvent } from "../types.ts";

type Options = {
  url: string;
  name: string;
  maxPoints?: number;
};

export function useSseSeries({ url, name, maxPoints = 100}: Options) {
  const [points, setPoints] = useState<Point[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = event => {
      try {
        const payload: SseChartEvent = JSON.parse(event.data);
        if (payload.symbol !== name) return;

        setPoints(prev => {
          const next: Point[] = [...prev, { time: payload.time, value: payload.value}];
          return next.length > maxPoints ? next.slice(next.length - maxPoints) : next;
        });
      } catch (e) {
        console.error('Bad SSE payload', e);
      }
    };

    es.onerror = err => {
      console.error('SSE error', err);
      es.close();
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [url, name, maxPoints]);

  return points;
}