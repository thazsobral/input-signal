import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  InputEventRecord,
  KeyboardLayoutType,
  SwitchDiagnosticState,
  MouseState,
  MouseButtonState,
} from './types';
import { detectDefaultLayout } from './utils/keyboardLayouts';
import { soundManager } from './utils/audio';
import { Header } from './components/Header';
import { KeyboardWorkbench } from './components/KeyboardWorkbench';
import { MouseWorkbench } from './components/MouseWorkbench';
import { PressureMonitor } from './components/PressureMonitor';
import { AuxiliarySensors } from './components/AuxiliarySensors';
import { EventLogPanel } from './components/EventLogPanel';
import { DeviceScannerPanel } from './components/DeviceScannerPanel';
import { ChatteringReportDrawer } from './components/ChatteringReportDrawer';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { WifiOff, SlidersHorizontal, Sparkles } from 'lucide-react';

const INITIAL_BUTTON_STATE: MouseButtonState = {
  isPressed: false,
  pressCount: 0,
  lastPressTime: 0,
  lastReleaseTime: 0,
  currentHoldDurationMs: 0,
  currentPressStart: null,
  hasAnomaly: false,
  anomalyCount: 0,
  recentBouncesMs: [],
};

export default function App() {
  const isOnline = useOnlineStatus();

  // Layout & Theme state
  const [detectedLayout] = useState<KeyboardLayoutType>(() => detectDefaultLayout());
  const [layout, setLayout] = useState<KeyboardLayoutType>(() => {
    const saved = localStorage.getItem('input-signal-layout');
    return (saved as KeyboardLayoutType) || detectDefaultLayout();
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('input-signal-theme');
    if (saved) return saved === 'dark';
    return true; // default dark workbench
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Switch diagnostics state: key code -> switch state
  const [switches, setSwitches] = useState<Record<string, SwitchDiagnosticState>>({});
  const [lastActiveCode, setLastActiveCode] = useState<string | null>(null);

  // Mouse diagnostics state
  const [mouseState, setMouseState] = useState<MouseState>({
    m1: { ...INITIAL_BUTTON_STATE },
    m2: { ...INITIAL_BUTTON_STATE },
    m3: { ...INITIAL_BUTTON_STATE },
    m4: { ...INITIAL_BUTTON_STATE },
    m5: { ...INITIAL_BUTTON_STATE },
    wheel: {
      active: false,
      direction: null,
      lastDelta: 0,
      lastTimestamp: 0,
      totalScrolls: 0,
    },
    coords: { x: 0, y: 0, padX: 0, padY: 0 },
    cps: 0,
    peakCps: 0,
    clickTimestamps: [],
  });

  // Event stream state
  const [events, setEvents] = useState<InputEventRecord[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  isPausedRef.current = isPaused;

  // Collapsible panels state (default collapsed for a minimalist workbench)
  const [isLogExpanded, setIsLogExpanded] = useState<boolean>(false);
  const [isDevicesExpanded, setIsDevicesExpanded] = useState<boolean>(false);
  const [isChatteringExpanded, setIsChatteringExpanded] = useState<boolean>(false);

  // Numpad hardware detection and display toggle
  const [hasNumpadDetected, setHasNumpadDetected] = useState<boolean>(false);
  const [showNumpad, setShowNumpad] = useState<boolean>(false);

  // Worker & Background processing
  const workerRef = useRef<Worker | null>(null);
  const [workerMinBounce, setWorkerMinBounce] = useState<number | null>(null);
  const [workerAvgBounce, setWorkerAvgBounce] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('light');
      root.classList.add('dark');
      localStorage.setItem('input-signal-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('input-signal-theme', 'light');
    }
  }, [isDarkMode]);

  // Layout persistence
  const handleLayoutChange = (newLayout: KeyboardLayoutType) => {
    setLayout(newLayout);
    localStorage.setItem('input-signal-layout', newLayout);
  };

  // Sound alert toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
  };

  // Initialize Web Worker for background analytics
  useEffect(() => {
    try {
      const worker = new Worker(new URL('./workers/diagnostics.worker.ts', import.meta.url), {
        type: 'module',
      });

      worker.onmessage = (e: MessageEvent) => {
        const { type, payload } = e.data;
        if (type === 'STATS_UPDATED') {
          setWorkerMinBounce(payload.stats.minBounceMs);
          setWorkerAvgBounce(payload.stats.avgBounceMs);
        } else if (type === 'EXPORT_READY') {
          const content = payload.content || payload.jsonString;
          const mimeType = payload.mimeType || 'application/json';
          const filename = payload.filename || `input-signal-export-${Date.now()}.json`;
          const blob = new Blob([content], { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setIsExporting(false);
        }
      };

      workerRef.current = worker;
      return () => {
        worker.terminate();
      };
    } catch {
      // Fallback if worker unsupported
    }
  }, []);

  // Helper to append events and notify worker
  const recordEvent = useCallback((event: InputEventRecord) => {
    if (isPausedRef.current) return;

    setEvents((prev) => {
      const next = [...prev.slice(-499), event]; // keep last 500 in React UI state
      return next;
    });

    // Send batch to worker
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'PROCESS_BATCH',
        payload: { events: [event] },
      });
    }
  }, []);

  // Continuous hold duration animation loop
  useEffect(() => {
    let animationFrameId: number;

    const updateHolds = () => {
      const now = performance.now();

      setSwitches((prev) => {
        let changed = false;
        const updated = { ...prev };

        for (const [code, item] of Object.entries(updated)) {
          if (item.isPressed && item.currentPressStart !== null) {
            const holdMs = now - item.currentPressStart;
            if (Math.abs(item.currentHoldDurationMs - holdMs) > 10) {
              changed = true;
              updated[code] = {
                ...item,
                currentHoldDurationMs: holdMs,
                maxHoldDurationMs: Math.max(item.maxHoldDurationMs, holdMs),
              };
            }
          }
        }
        return changed ? updated : prev;
      });

      // Update CPS rolling window
      setMouseState((prev) => {
        const threshold = Date.now() - 1000;
        const recentClicks = prev.clickTimestamps.filter((t) => t > threshold);
        const currentCps = recentClicks.length;
        const newPeak = Math.max(prev.peakCps, currentCps);

        if (recentClicks.length !== prev.clickTimestamps.length || prev.cps !== currentCps) {
          return {
            ...prev,
            clickTimestamps: recentClicks,
            cps: currentCps,
            peakCps: newPeak,
          };
        }
        return prev;
      });

      animationFrameId = requestAnimationFrame(updateHolds);
    };

    animationFrameId = requestAnimationFrame(updateHolds);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Format millisecond timestamp
  const getFormattedTime = () => {
    const d = new Date();
    const pad = (n: number, z = 2) => String(n).padStart(z, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
  };

  // Keyboard Event Handlers (Raw zero-latency listeners)
  useEffect(() => {
    const SCROLL_KEYS = new Set([
      'Space',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'PageUp',
      'PageDown',
      'Home',
      'End',
      'Tab',
    ]);

    const F_KEYS = new Set([
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
      'F13', 'F14', 'F15', 'F16', 'F17', 'F18', 'F19', 'F20', 'F21', 'F22', 'F23', 'F24',
      'PrintScreen', 'ScrollLock', 'Pause'
    ]);

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTypingField =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT');

      const isFKey =
        F_KEYS.has(e.code) ||
        /^F([1-9]|1[0-9]|2[0-4])$/i.test(e.code) ||
        /^F([1-9]|1[0-9]|2[0-4])$/i.test(e.key);

      // Strict Scroll & Function Key Interception:
      // Prevent browser default actions (F1 Help, F3 Search, F5 Reload, F6 Address Bar, F7 Caret, F11 Fullscreen, F12 DevTools)
      if (!isTypingField && (SCROLL_KEYS.has(e.code) || isFKey)) {
        e.preventDefault();
      }

      // Ignore native repeat keydown to avoid fake chattering detections on key held down
      if (e.repeat) return;

      const now = performance.now();
      let code = e.code;
      if (isFKey) {
        if (!code.toUpperCase().startsWith('F') && /^F([1-9]|1[0-9]|2[0-4])$/i.test(e.key)) {
          code = e.key.toUpperCase();
        } else if (/^F([1-9]|1[0-9]|2[0-4])$/i.test(code)) {
          code = code.toUpperCase();
        }
      }

      let displayName = e.key === ' ' ? 'Barra de Espaço' : e.key;
      if (isFKey) {
        displayName = code.toUpperCase();
      }

      // Detect Physical Numpad hardware activity
      const isNumpad = code.startsWith('Numpad') || code === 'NumLock';
      if (isNumpad) {
        setHasNumpadDetected(true);
        setShowNumpad(true);
        if (code === 'NumLock') displayName = 'Num Lock';
        else if (code === 'NumpadEnter') displayName = 'Enter (Num)';
        else if (code === 'NumpadDivide') displayName = '/ (Num)';
        else if (code === 'NumpadMultiply') displayName = '* (Num)';
        else if (code === 'NumpadSubtract') displayName = '- (Num)';
        else if (code === 'NumpadAdd') displayName = '+ (Num)';
        else if (code === 'NumpadDecimal') displayName = '. (Num)';
        else if (code === 'NumpadComma') displayName = ', (Num)';
        else if (/^Numpad\d$/.test(code)) displayName = `${code.replace('Numpad', '')} (Num)`;
      }

      setLastActiveCode(code);

      setSwitches((prev) => {
        const existing = prev[code] || {
          code,
          displayName,
          isPressed: false,
          pressCount: 0,
          lastPressTimestamp: 0,
          lastReleaseTimestamp: 0,
          currentPressStart: null,
          currentHoldDurationMs: 0,
          maxHoldDurationMs: 0,
          hasAnomaly: false,
          anomalyCount: 0,
          lastAnomalyTimestamp: null,
          recentBouncesMs: [],
          shortestBounceMs: null,
        };

        // Anti-Chattering Algorithm:
        // When switch closes, measure interval since last release
        const delta = existing.lastReleaseTimestamp > 0 ? now - existing.lastReleaseTimestamp : null;
        const isChattering = delta !== null && delta < 130 && delta > 0;

        if (isChattering) {
          soundManager.playAnomalyAlert('chattering');
        }

        const newShortest =
          delta !== null
            ? existing.shortestBounceMs === null
              ? delta
              : Math.min(existing.shortestBounceMs, delta)
            : existing.shortestBounceMs;

        const updatedState: SwitchDiagnosticState = {
          ...existing,
          displayName,
          isPressed: true,
          pressCount: existing.pressCount + 1,
          lastPressTimestamp: now,
          currentPressStart: now,
          currentHoldDurationMs: 0,
          hasAnomaly: existing.hasAnomaly || isChattering,
          anomalyCount: isChattering ? existing.anomalyCount + 1 : existing.anomalyCount,
          lastAnomalyTimestamp: isChattering ? now : existing.lastAnomalyTimestamp,
          recentBouncesMs: delta !== null ? [delta, ...existing.recentBouncesMs.slice(0, 9)] : existing.recentBouncesMs,
          shortestBounceMs: newShortest,
        };

        // Record event
        recordEvent({
          id: `key-${code}-${now}`,
          timestamp: now,
          formattedTime: getFormattedTime(),
          type: 'keydown',
          source: 'keyboard',
          code,
          displayName,
          isAnomaly: isChattering,
          anomalyType: isChattering ? 'chattering' : undefined,
          anomalyDetails: isChattering ? `Chattering anômalo: repique de ${Math.round(delta)}ms (< 130ms)` : undefined,
          deltaMs: delta !== null ? delta : undefined,
        });

        return {
          ...prev,
          [code]: updatedState,
        };
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTypingField =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT');

      const isFKey =
        F_KEYS.has(e.code) ||
        /^F([1-9]|1[0-9]|2[0-4])$/i.test(e.code) ||
        /^F([1-9]|1[0-9]|2[0-4])$/i.test(e.key);

      if (!isTypingField && (SCROLL_KEYS.has(e.code) || isFKey)) {
        e.preventDefault();
      }

      const now = performance.now();
      let code = e.code;
      if (isFKey) {
        if (!code.toUpperCase().startsWith('F') && /^F([1-9]|1[0-9]|2[0-4])$/i.test(e.key)) {
          code = e.key.toUpperCase();
        } else if (/^F([1-9]|1[0-9]|2[0-4])$/i.test(code)) {
          code = code.toUpperCase();
        }
      }

      let displayName = e.key === ' ' ? 'Barra de Espaço' : e.key;
      if (isFKey) {
        displayName = code.toUpperCase();
      }

      const isNumpad = code.startsWith('Numpad') || code === 'NumLock';
      if (isNumpad) {
        if (code === 'NumLock') displayName = 'Num Lock';
        else if (code === 'NumpadEnter') displayName = 'Enter (Num)';
        else if (code === 'NumpadDivide') displayName = '/ (Num)';
        else if (code === 'NumpadMultiply') displayName = '* (Num)';
        else if (code === 'NumpadSubtract') displayName = '- (Num)';
        else if (code === 'NumpadAdd') displayName = '+ (Num)';
        else if (code === 'NumpadDecimal') displayName = '. (Num)';
        else if (code === 'NumpadComma') displayName = ', (Num)';
        else if (/^Numpad\d$/.test(code)) displayName = `${code.replace('Numpad', '')} (Num)`;
      }

      setSwitches((prev) => {
        const existing = prev[code];
        if (!existing) return prev;

        const holdDuration = existing.currentPressStart !== null ? now - existing.currentPressStart : 0;

        const updatedState: SwitchDiagnosticState = {
          ...existing,
          isPressed: false,
          lastReleaseTimestamp: now,
          currentPressStart: null,
          currentHoldDurationMs: holdDuration,
          maxHoldDurationMs: Math.max(existing.maxHoldDurationMs, holdDuration),
        };

        // Record keyup event
        recordEvent({
          id: `keyup-${code}-${now}`,
          timestamp: now,
          formattedTime: getFormattedTime(),
          type: 'keyup',
          source: 'keyboard',
          code,
          displayName,
          durationMs: holdDuration,
          isAnomaly: false,
        });

        return {
          ...prev,
          [code]: updatedState,
        };
      });
    };

    // Capture true guarantees raw zero-latency input intercept before browser default handlers
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
    };
  }, [recordEvent]);

  // Mouse Workbench Event Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const now = performance.now();
    const buttonIndex = e.button; // 0=M1, 1=M3, 2=M2, 3=M4, 4=M5

    let buttonKey: keyof Pick<MouseState, 'm1' | 'm2' | 'm3' | 'm4' | 'm5'> = 'm1';
    let btnName = 'M1 (Esquerdo)';

    if (buttonIndex === 0) {
      buttonKey = 'm1';
      btnName = 'M1 (Esquerdo)';
    } else if (buttonIndex === 1) {
      buttonKey = 'm3';
      btnName = 'M3 (Scroll Click)';
    } else if (buttonIndex === 2) {
      buttonKey = 'm2';
      btnName = 'M2 (Direito)';
    } else if (buttonIndex === 3) {
      buttonKey = 'm4';
      btnName = 'M4 (Lateral Voltar)';
    } else if (buttonIndex === 4) {
      buttonKey = 'm5';
      btnName = 'M5 (Lateral Avançar)';
    }

    setMouseState((prev) => {
      const btn = prev[buttonKey];
      const delta = btn.lastReleaseTime > 0 ? now - btn.lastReleaseTime : null;
      const isChattering = delta !== null && delta < 130 && delta > 0;

      if (isChattering) {
        soundManager.playAnomalyAlert('chattering');
      }

      const updatedBtn: MouseButtonState = {
        ...btn,
        isPressed: true,
        pressCount: btn.pressCount + 1,
        lastPressTime: now,
        currentPressStart: now,
        hasAnomaly: btn.hasAnomaly || isChattering,
        anomalyCount: isChattering ? btn.anomalyCount + 1 : btn.anomalyCount,
        recentBouncesMs: delta !== null ? [delta, ...btn.recentBouncesMs.slice(0, 9)] : btn.recentBouncesMs,
      };

      recordEvent({
        id: `mouse-${buttonKey}-${now}`,
        timestamp: now,
        formattedTime: getFormattedTime(),
        type: 'mousedown',
        source: 'mouse',
        code: buttonKey.toUpperCase(),
        displayName: btnName,
        isAnomaly: isChattering,
        anomalyType: isChattering ? 'double_click' : undefined,
        anomalyDetails: isChattering ? `Double-Click fantasma / Chattering: ${Math.round(delta)}ms` : undefined,
        deltaMs: delta !== null ? delta : undefined,
      });

      return {
        ...prev,
        [buttonKey]: updatedBtn,
        totalClicks: (prev as any).totalClicks ? (prev as any).totalClicks + 1 : 1,
        clickTimestamps: [...prev.clickTimestamps, Date.now()],
      };
    });
  }, [recordEvent]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const now = performance.now();
    const buttonIndex = e.button;

    let buttonKey: keyof Pick<MouseState, 'm1' | 'm2' | 'm3' | 'm4' | 'm5'> = 'm1';
    let btnName = 'M1 (Esquerdo)';

    if (buttonIndex === 0) buttonKey = 'm1';
    else if (buttonIndex === 1) {
      buttonKey = 'm3';
      btnName = 'M3 (Scroll Click)';
    } else if (buttonIndex === 2) {
      buttonKey = 'm2';
      btnName = 'M2 (Direito)';
    } else if (buttonIndex === 3) {
      buttonKey = 'm4';
      btnName = 'M4 (Lateral Voltar)';
    } else if (buttonIndex === 4) {
      buttonKey = 'm5';
      btnName = 'M5 (Lateral Avançar)';
    }

    setMouseState((prev) => {
      const btn = prev[buttonKey];
      const holdDuration = btn.currentPressStart !== null ? now - btn.currentPressStart : 0;

      const updatedBtn: MouseButtonState = {
        ...btn,
        isPressed: false,
        lastReleaseTime: now,
        currentPressStart: null,
        currentHoldDurationMs: holdDuration,
      };

      recordEvent({
        id: `mouseup-${buttonKey}-${now}`,
        timestamp: now,
        formattedTime: getFormattedTime(),
        type: 'mouseup',
        source: 'mouse',
        code: buttonKey.toUpperCase(),
        displayName: btnName,
        durationMs: holdDuration,
        isAnomaly: false,
      });

      return {
        ...prev,
        [buttonKey]: updatedBtn,
      };
    });
  }, [recordEvent]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const now = performance.now();
    const direction = e.deltaY < 0 ? 'up' : 'down';

    setMouseState((prev) => ({
      ...prev,
      wheel: {
        active: true,
        direction,
        lastDelta: e.deltaY,
        lastTimestamp: now,
        totalScrolls: prev.wheel.totalScrolls + 1,
      },
    }));

    recordEvent({
      id: `wheel-${now}`,
      timestamp: now,
      formattedTime: getFormattedTime(),
      type: 'wheel',
      source: 'mouse',
      code: direction === 'up' ? 'WheelUp' : 'WheelDown',
      displayName: direction === 'up' ? 'Scroll Cima (▲)' : 'Scroll Baixo (▼)',
      isAnomaly: false,
    });

    // Reset active flag after brief flash
    setTimeout(() => {
      setMouseState((prev) => ({
        ...prev,
        wheel: {
          ...prev.wheel,
          active: false,
        },
      }));
    }, 180);
  }, [recordEvent]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const padX = Math.round(e.clientX - rect.left);
    const padY = Math.round(e.clientY - rect.top);

    setMouseState((prev) => ({
      ...prev,
      coords: {
        x: e.clientX,
        y: e.clientY,
        padX,
        padY,
      },
    }));
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // Suppress context menu in the testing zone so M2 right-click can be freely tested
    e.preventDefault();
  }, []);

  // Clear all history & reset diagnostics
  const handleClearHistory = () => {
    setSwitches({});
    setLastActiveCode(null);
    setMouseState({
      m1: { ...INITIAL_BUTTON_STATE },
      m2: { ...INITIAL_BUTTON_STATE },
      m3: { ...INITIAL_BUTTON_STATE },
      m4: { ...INITIAL_BUTTON_STATE },
      m5: { ...INITIAL_BUTTON_STATE },
      wheel: {
        active: false,
        direction: null,
        lastDelta: 0,
        lastTimestamp: 0,
        totalScrolls: 0,
      },
      coords: { x: 0, y: 0, padX: 0, padY: 0 },
      cps: 0,
      peakCps: 0,
      clickTimestamps: [],
    });
    setEvents([]);
    setWorkerMinBounce(null);
    setWorkerAvgBounce(null);

    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'CLEAR_ALL' });
    }
  };

  // Export logs in JSON or CSV format via Web Worker
  const handleExportLogs = (format: 'json' | 'csv' = 'json') => {
    if (!workerRef.current) return;
    setIsExporting(true);
    workerRef.current.postMessage({ type: 'PREPARE_EXPORT', payload: { format } });
  };

  // Aggregate metrics
  const totalAnomalies = Object.values(switches).reduce((acc, s) => acc + s.anomalyCount, 0) +
    mouseState.m1.anomalyCount +
    mouseState.m2.anomalyCount +
    mouseState.m3.anomalyCount;

  const activeKeysCount = Object.values(switches).filter((s) => s.isPressed).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Main Navigation Header */}
      <Header
        layout={layout}
        onLayoutChange={handleLayoutChange}
        detectedLayout={detectedLayout}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onClearHistory={handleClearHistory}
        onExportLogs={handleExportLogs}
        totalAnomalies={totalAnomalies}
      />

      {/* Offline Alert Badge if connection lost */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-mono font-bold flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          Modo Offline Ativo — PWA em execução local com latência zero garantida.
        </div>
      )}

      {/* Main Bench Work Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-4 sm:gap-6">
        
        {/* Core Hardware Setup Section: Vector Keyboard Matrix */}
        <section id="keyboard-matrix-section">
          <KeyboardWorkbench
            layout={layout}
            switches={switches}
            lastActiveCode={lastActiveCode}
            activeCount={activeKeysCount}
            hasNumpadDetected={hasNumpadDetected}
            showNumpad={showNumpad}
            onToggleNumpad={() => setShowNumpad(!showNumpad)}
          />
        </section>

        {/* Core Hardware Setup Section: Ergonomic Optical Mouse */}
        <section id="mouse-workbench-section">
          <MouseWorkbench
            mouseState={mouseState}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onMouseMove={handleMouseMove}
            onContextMenu={handleContextMenu}
          />
        </section>

        {/* Continuous Pressure Monitor & Switch Quality Oscilloscope */}
        <section id="pressure-monitor-section">
          <PressureMonitor
            spaceSwitch={switches['Space']}
            lastActiveSwitch={lastActiveCode ? switches[lastActiveCode] : undefined}
            minBounceMs={workerMinBounce}
            avgBounceMs={workerAvgBounce}
          />
        </section>

        {/* Auxiliary Sensor Modules: Live Webcam & Microphone dB VU Meter */}
        <section id="auxiliary-sensors-section">
          <AuxiliarySensors />
        </section>

        {/* Collapsible Secondary Technical Analytics Panels (Sob Demanda) */}
        <section className="flex flex-col gap-3 pt-2">
          
          {/* Panel 1: Event Log Stream (Expansível) */}
          <EventLogPanel
            events={events}
            isExpanded={isLogExpanded}
            onToggleExpand={() => setIsLogExpanded(!isLogExpanded)}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(!isPaused)}
            totalEvents={events.length}
            anomalyCount={totalAnomalies}
            onExportJson={() => handleExportLogs('json')}
            onExportCsv={() => handleExportLogs('csv')}
            isExporting={isExporting}
          />

          {/* Panel 2: Technical Chattering & Switch Health Breakdown (Expansível) */}
          <ChatteringReportDrawer
            isExpanded={isChatteringExpanded}
            onToggleExpand={() => setIsChatteringExpanded(!isChatteringExpanded)}
            switches={switches}
            chatteringCount={totalAnomalies}
            minBounceMs={workerMinBounce}
            avgBounceMs={workerAvgBounce}
          />

          {/* Panel 3: Connected Peripherals & Controllers Scanner (Expansível) */}
          <DeviceScannerPanel
            isExpanded={isDevicesExpanded}
            onToggleExpand={() => setIsDevicesExpanded(!isDevicesExpanded)}
            hasNumpadDetected={hasNumpadDetected}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-5 px-4 text-xs font-mono text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="font-semibold text-slate-300 tracking-wide">input-signal</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400">Bancada de Teste e Diagnóstico de Periféricos</span>
          </div>
          <p className="text-slate-400">
            © {new Date().getFullYear()} ThazSobral. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
