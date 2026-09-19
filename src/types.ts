export type InputEventType = 'keydown' | 'keyup' | 'mousedown' | 'mouseup' | 'wheel' | 'contextmenu';

export type InputSource = 'keyboard' | 'mouse';

export type AnomalyType = 'chattering' | 'pressure_loss' | 'double_click' | 'rapid_bounce';

export interface InputEventRecord {
  id: string;
  timestamp: number;
  formattedTime: string;
  type: InputEventType;
  source: InputSource;
  code: string;
  displayName: string;
  durationMs?: number;
  isAnomaly: boolean;
  anomalyType?: AnomalyType;
  anomalyDetails?: string;
  deltaMs?: number;
}

export type KeyboardLayoutType = 'ABNT2' | 'ANSI' | 'ISO_PT' | 'AZERTY' | 'QWERTZ';

export interface KeyDefinition {
  code: string;
  primary: string;
  shift?: string;
  altGr?: string;
  width?: number; // width multiplier relative to 1u (standard key)
  row: number;
  className?: string;
}

export interface SwitchDiagnosticState {
  code: string;
  displayName: string;
  isPressed: boolean;
  pressCount: number;
  lastPressTimestamp: number;
  lastReleaseTimestamp: number;
  currentPressStart: number | null;
  currentHoldDurationMs: number;
  maxHoldDurationMs: number;
  hasAnomaly: boolean;
  anomalyCount: number;
  lastAnomalyTimestamp: number | null;
  recentBouncesMs: number[];
  shortestBounceMs: number | null;
}

export interface MouseButtonState {
  isPressed: boolean;
  pressCount: number;
  lastPressTime: number;
  lastReleaseTime: number;
  currentHoldDurationMs: number;
  currentPressStart: number | null;
  hasAnomaly: boolean;
  anomalyCount: number;
  recentBouncesMs: number[];
}

export interface MouseState {
  m1: MouseButtonState; // Left
  m2: MouseButtonState; // Right
  m3: MouseButtonState; // Middle
  m4: MouseButtonState; // Side Back
  m5: MouseButtonState; // Side Forward
  wheel: {
    active: boolean;
    direction: 'up' | 'down' | null;
    lastDelta: number;
    lastTimestamp: number;
    totalScrolls: number;
  };
  coords: {
    x: number;
    y: number;
    padX: number;
    padY: number;
  };
  cps: number;
  peakCps: number;
  clickTimestamps: number[];
}

export interface ConnectedDeviceInfo {
  id: string;
  label: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput' | 'gamepad' | 'pointer' | 'keyboard' | 'hid' | 'usb';
  vendorId?: string;
  productId?: string;
  manufacturerName?: string;
  groupId?: string;
  connectedAt: number;
}

export interface WorkerAnalyzeMessage {
  type: 'ANALYZE_EVENTS' | 'EXPORT_JSON' | 'SEARCH_LOGS';
  payload: any;
}

export interface WorkerResponseMessage {
  type: 'STATS_UPDATED' | 'EXPORT_READY' | 'SEARCH_RESULTS';
  payload: any;
}
