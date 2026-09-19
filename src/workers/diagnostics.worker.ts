import { InputEventRecord } from '../types';

interface WorkerStats {
  totalProcessed: number;
  anomalyCount: number;
  chatteringCount: number;
  minBounceMs: number | null;
  avgBounceMs: number | null;
  histogram: {
    under20ms: number;
    under50ms: number;
    under90ms: number;
    under130ms: number; // Chattering danger threshold (<130ms)
    normalOver130ms: number;
  };
  keyHealthSummary: Record<string, {
    totalPresses: number;
    anomalies: number;
    shortestBounceMs: number | null;
    avgHoldMs: number;
  }>;
}

let storedEvents: InputEventRecord[] = [];
let stats: WorkerStats = {
  totalProcessed: 0,
  anomalyCount: 0,
  chatteringCount: 0,
  minBounceMs: null,
  avgBounceMs: null,
  histogram: {
    under20ms: 0,
    under50ms: 0,
    under90ms: 0,
    under130ms: 0,
    normalOver130ms: 0,
  },
  keyHealthSummary: {},
};

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'PROCESS_BATCH': {
      const newEvents: InputEventRecord[] = payload.events || [];
      storedEvents = storedEvents.concat(newEvents);
      // Keep up to 20,000 events in worker memory
      if (storedEvents.length > 20000) {
        storedEvents = storedEvents.slice(storedEvents.length - 20000);
      }

      // Recompute stats
      recalculateStats();

      self.postMessage({
        type: 'STATS_UPDATED',
        payload: {
          stats,
          totalStored: storedEvents.length,
        },
      });
      break;
    }

    case 'CLEAR_ALL': {
      storedEvents = [];
      stats = {
        totalProcessed: 0,
        anomalyCount: 0,
        chatteringCount: 0,
        minBounceMs: null,
        avgBounceMs: null,
        histogram: {
          under20ms: 0,
          under50ms: 0,
          under90ms: 0,
          under130ms: 0,
          normalOver130ms: 0,
        },
        keyHealthSummary: {},
      };
      self.postMessage({
        type: 'STATS_UPDATED',
        payload: { stats, totalStored: 0 },
      });
      break;
    }

    case 'PREPARE_EXPORT': {
      const format = payload?.format || 'json';
      if (format === 'csv') {
        const header = 'Timestamp_Formatted,Action_Type,Source,Code,DisplayName,Duration_ms,Delta_ms,IsAnomaly,AnomalyType,AnomalyDetails\n';
        const rows = storedEvents.map((e) => {
          const cleanDetails = (e.anomalyDetails || '').replace(/,/g, ';');
          return `${e.formattedTime || ''},${e.type},${e.source},${e.code},"${e.displayName}",${e.durationMs ? Math.round(e.durationMs) : ''},${e.deltaMs !== undefined ? Math.round(e.deltaMs) : ''},${e.isAnomaly ? 'YES' : 'NO'},${e.anomalyType || ''},"${cleanDetails}"`;
        }).join('\n');
        
        self.postMessage({
          type: 'EXPORT_READY',
          payload: {
            content: header + rows,
            mimeType: 'text/csv',
            filename: `input-signal-logs-${Date.now()}.csv`,
          },
        });
      } else {
        const exportData = {
          application: 'input-signal',
          exportedAt: new Date().toISOString(),
          summary: stats,
          eventCount: storedEvents.length,
          events: storedEvents,
        };
        const jsonString = JSON.stringify(exportData, null, 2);
        self.postMessage({
          type: 'EXPORT_READY',
          payload: {
            content: jsonString,
            mimeType: 'application/json',
            filename: `input-signal-diagnostic-${Date.now()}.json`,
          },
        });
      }
      break;
    }

    case 'FILTER_LOGS': {
      const { query, filterSource, anomaliesOnly } = payload;
      const q = (query || '').toLowerCase();

      const filtered = storedEvents.filter((item) => {
        if (anomaliesOnly && !item.isAnomaly) return false;
        if (filterSource && filterSource !== 'all' && item.source !== filterSource) return false;
        if (q) {
          return (
            item.code.toLowerCase().includes(q) ||
            item.displayName.toLowerCase().includes(q) ||
            item.type.toLowerCase().includes(q) ||
            (item.anomalyDetails && item.anomalyDetails.toLowerCase().includes(q))
          );
        }
        return true;
      });

      self.postMessage({
        type: 'FILTER_RESULTS',
        payload: {
          results: filtered.slice(-200), // Return last 200 filtered for UI display
          totalMatches: filtered.length,
        },
      });
      break;
    }

    default:
      break;
  }
};

function recalculateStats() {
  let anomalies = 0;
  let chattering = 0;
  let minBounce: number | null = null;
  let bounceSum = 0;
  let bounceCount = 0;

  const histogram = {
    under20ms: 0,
    under50ms: 0,
    under90ms: 0,
    under130ms: 0,
    normalOver130ms: 0,
  };

  const keyMap: Record<string, { totalPresses: number; anomalies: number; shortestBounceMs: number | null; totalHold: number; holdCount: number }> = {};

  for (let i = 0; i < storedEvents.length; i++) {
    const ev = storedEvents[i];
    if (ev.isAnomaly) {
      anomalies++;
      if (ev.anomalyType === 'chattering') {
        chattering++;
      }
    }

    if (ev.deltaMs !== undefined && ev.deltaMs > 0) {
      const d = ev.deltaMs;
      bounceSum += d;
      bounceCount++;
      if (minBounce === null || d < minBounce) {
        minBounce = d;
      }

      if (d < 20) histogram.under20ms++;
      else if (d < 50) histogram.under50ms++;
      else if (d < 90) histogram.under90ms++;
      else if (d < 130) histogram.under130ms++;
      else histogram.normalOver130ms++;
    }

    if (!keyMap[ev.code]) {
      keyMap[ev.code] = { totalPresses: 0, anomalies: 0, shortestBounceMs: null, totalHold: 0, holdCount: 0 };
    }
    if (ev.type === 'keydown' || ev.type === 'mousedown') {
      keyMap[ev.code].totalPresses++;
    }
    if (ev.isAnomaly) {
      keyMap[ev.code].anomalies++;
    }
    if (ev.durationMs) {
      keyMap[ev.code].totalHold += ev.durationMs;
      keyMap[ev.code].holdCount++;
    }
    if (ev.deltaMs !== undefined && ev.deltaMs > 0) {
      const prevShortest = keyMap[ev.code].shortestBounceMs;
      if (prevShortest === null || ev.deltaMs < prevShortest) {
        keyMap[ev.code].shortestBounceMs = ev.deltaMs;
      }
    }
  }

  const keyHealthSummary: WorkerStats['keyHealthSummary'] = {};
  for (const [code, data] of Object.entries(keyMap)) {
    keyHealthSummary[code] = {
      totalPresses: data.totalPresses,
      anomalies: data.anomalies,
      shortestBounceMs: data.shortestBounceMs,
      avgHoldMs: data.holdCount > 0 ? Math.round(data.totalHold / data.holdCount) : 0,
    };
  }

  stats = {
    totalProcessed: storedEvents.length,
    anomalyCount: anomalies,
    chatteringCount: chattering,
    minBounceMs: minBounce,
    avgBounceMs: bounceCount > 0 ? Math.round(bounceSum / bounceCount) : null,
    histogram,
    keyHealthSummary,
  };
}
