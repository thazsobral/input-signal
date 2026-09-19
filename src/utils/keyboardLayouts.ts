import { KeyboardLayoutType, KeyDefinition } from '../types';

export function detectDefaultLayout(): KeyboardLayoutType {
  if (typeof navigator === 'undefined') return 'ABNT2';
  const lang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
  if (lang.includes('pt-br')) return 'ABNT2';
  if (lang.includes('pt')) return 'ISO_PT';
  if (lang.includes('fr')) return 'AZERTY';
  if (lang.includes('de') || lang.includes('at') || lang.includes('ch')) return 'QWERTZ';
  return 'ABNT2'; // Default to ABNT2 as primary user request is in Portuguese
}

// Universal Function Row (Esc, F1-F12, PrtSc, Del)
export const FUNCTION_ROW: KeyDefinition[] = [
  { code: 'Escape', primary: 'Esc', row: 0, width: 1.2 },
  { code: 'F1', primary: 'F1', row: 0, width: 1 },
  { code: 'F2', primary: 'F2', row: 0, width: 1 },
  { code: 'F3', primary: 'F3', row: 0, width: 1 },
  { code: 'F4', primary: 'F4', row: 0, width: 1 },
  { code: 'F5', primary: 'F5', row: 0, width: 1 },
  { code: 'F6', primary: 'F6', row: 0, width: 1 },
  { code: 'F7', primary: 'F7', row: 0, width: 1 },
  { code: 'F8', primary: 'F8', row: 0, width: 1 },
  { code: 'F9', primary: 'F9', row: 0, width: 1 },
  { code: 'F10', primary: 'F10', row: 0, width: 1 },
  { code: 'F11', primary: 'F11', row: 0, width: 1 },
  { code: 'F12', primary: 'F12', row: 0, width: 1 },
  { code: 'PrintScreen', primary: 'PrtSc', row: 0, width: 1.2 },
  { code: 'Delete', primary: 'Del', row: 0, width: 1.4 },
];

// ABNT2 (Brasil - Ç dedicado + ? / físico)
export const ABNT2_KEYS: KeyDefinition[] = [
  // Row 0 - Function Row
  ...FUNCTION_ROW,

  // Row 1 - Number Row
  { code: 'Quote', primary: "'", shift: '"', row: 1, width: 1.2 },
  { code: 'Digit1', primary: '1', shift: '!', altGr: '¹', row: 1, width: 1 },
  { code: 'Digit2', primary: '2', shift: '@', altGr: '²', row: 1, width: 1 },
  { code: 'Digit3', primary: '3', shift: '#', altGr: '³', row: 1, width: 1 },
  { code: 'Digit4', primary: '4', shift: '$', altGr: '£', row: 1, width: 1 },
  { code: 'Digit5', primary: '5', shift: '%', altGr: '¢', row: 1, width: 1 },
  { code: 'Digit6', primary: '6', shift: '¨', altGr: '¬', row: 1, width: 1 },
  { code: 'Digit7', primary: '7', shift: '&', row: 1, width: 1 },
  { code: 'Digit8', primary: '8', shift: '*', row: 1, width: 1 },
  { code: 'Digit9', primary: '9', shift: '(', row: 1, width: 1 },
  { code: 'Digit0', primary: '0', shift: ')', row: 1, width: 1 },
  { code: 'Minus', primary: '-', shift: '_', row: 1, width: 1 },
  { code: 'Equal', primary: '=', shift: '+', altGr: '§', row: 1, width: 1 },
  { code: 'Backspace', primary: 'Backspace', row: 1, width: 2.6 },

  // Row 2 - QWERTY Row
  { code: 'Tab', primary: 'Tab', row: 2, width: 1.5 },
  { code: 'KeyQ', primary: 'Q', row: 2, width: 1 },
  { code: 'KeyW', primary: 'W', row: 2, width: 1 },
  { code: 'KeyE', primary: 'E', altGr: '€', row: 2, width: 1 },
  { code: 'KeyR', primary: 'R', row: 2, width: 1 },
  { code: 'KeyT', primary: 'T', row: 2, width: 1 },
  { code: 'KeyY', primary: 'Y', row: 2, width: 1 },
  { code: 'KeyU', primary: 'U', row: 2, width: 1 },
  { code: 'KeyI', primary: 'I', row: 2, width: 1 },
  { code: 'KeyO', primary: 'O', row: 2, width: 1 },
  { code: 'KeyP', primary: 'P', row: 2, width: 1 },
  { code: 'BracketLeft', primary: '´', shift: '`', row: 2, width: 1 },
  { code: 'BracketRight', primary: '[', shift: '{', altGr: 'ª', row: 2, width: 1 },
  { code: 'Enter', primary: 'Enter', row: 2, width: 2.3 },

  // Row 3 - Home Row
  { code: 'CapsLock', primary: 'Caps', row: 3, width: 1.8 },
  { code: 'KeyA', primary: 'A', row: 3, width: 1 },
  { code: 'KeyS', primary: 'S', row: 3, width: 1 },
  { code: 'KeyD', primary: 'D', row: 3, width: 1 },
  { code: 'KeyF', primary: 'F', row: 3, width: 1 },
  { code: 'KeyG', primary: 'G', row: 3, width: 1 },
  { code: 'KeyH', primary: 'H', row: 3, width: 1 },
  { code: 'KeyJ', primary: 'J', row: 3, width: 1 },
  { code: 'KeyK', primary: 'K', row: 3, width: 1 },
  { code: 'KeyL', primary: 'L', row: 3, width: 1 },
  { code: 'Semicolon', primary: 'Ç', row: 3, width: 1 },
  { code: 'Quote', primary: '~', shift: '^', row: 3, width: 1 },
  { code: 'Backslash', primary: ']', shift: '}', altGr: 'º', row: 3, width: 2.0 },

  // Row 4 - Bottom Letter Row
  { code: 'ShiftLeft', primary: 'Shift', row: 4, width: 1.3 },
  { code: 'IntlBackslash', primary: '\\', shift: '|', row: 4, width: 1 },
  { code: 'KeyZ', primary: 'Z', row: 4, width: 1 },
  { code: 'KeyX', primary: 'X', row: 4, width: 1 },
  { code: 'KeyC', primary: 'C', altGr: '₢', row: 4, width: 1 },
  { code: 'KeyV', primary: 'V', row: 4, width: 1 },
  { code: 'KeyB', primary: 'B', row: 4, width: 1 },
  { code: 'KeyN', primary: 'N', row: 4, width: 1 },
  { code: 'KeyM', primary: 'M', row: 4, width: 1 },
  { code: 'Comma', primary: ',', shift: '<', row: 4, width: 1 },
  { code: 'Period', primary: '.', shift: '>', row: 4, width: 1 },
  { code: 'Slash', primary: ';', shift: ':', row: 4, width: 1 },
  { code: 'IntlRo', primary: '/', shift: '?', altGr: '°', row: 4, width: 1 },
  { code: 'ShiftRight', primary: 'Shift', row: 4, width: 2.5 },

  // Row 5 - Modifier & Space Row
  { code: 'ControlLeft', primary: 'Ctrl', row: 5, width: 1.25 },
  { code: 'MetaLeft', primary: 'Win', row: 5, width: 1.25 },
  { code: 'AltLeft', primary: 'Alt', row: 5, width: 1.25 },
  { code: 'Space', primary: 'Barra de Espaço (Space)', row: 5, width: 6.05 },
  { code: 'AltRight', primary: 'AltGr', row: 5, width: 1.25 },
  { code: 'MetaRight', primary: 'Fn', row: 5, width: 1 },
  { code: 'ControlRight', primary: 'Ctrl', row: 5, width: 1.25 },
  { code: 'ArrowLeft', primary: '◄', row: 5, width: 0.85 },
  { code: 'ArrowUp', primary: '▲', row: 5, width: 0.85 },
  { code: 'ArrowDown', primary: '▼', row: 5, width: 0.85 },
  { code: 'ArrowRight', primary: '►', row: 5, width: 0.85 },
];

// ANSI Layout (US)
export const ANSI_KEYS: KeyDefinition[] = [
  // Row 0 - Function Row
  ...FUNCTION_ROW,

  // Row 1 - Number Row
  { code: 'Backquote', primary: '`', shift: '~', row: 1, width: 1.2 },
  { code: 'Digit1', primary: '1', shift: '!', row: 1, width: 1 },
  { code: 'Digit2', primary: '2', shift: '@', row: 1, width: 1 },
  { code: 'Digit3', primary: '3', shift: '#', row: 1, width: 1 },
  { code: 'Digit4', primary: '4', shift: '$', row: 1, width: 1 },
  { code: 'Digit5', primary: '5', shift: '%', row: 1, width: 1 },
  { code: 'Digit6', primary: '6', shift: '^', row: 1, width: 1 },
  { code: 'Digit7', primary: '7', shift: '&', row: 1, width: 1 },
  { code: 'Digit8', primary: '8', shift: '*', row: 1, width: 1 },
  { code: 'Digit9', primary: '9', shift: '(', row: 1, width: 1 },
  { code: 'Digit0', primary: '0', shift: ')', row: 1, width: 1 },
  { code: 'Minus', primary: '-', shift: '_', row: 1, width: 1 },
  { code: 'Equal', primary: '=', shift: '+', row: 1, width: 1 },
  { code: 'Backspace', primary: 'Backspace', row: 1, width: 2.6 },

  // Row 2 - QWERTY Row
  { code: 'Tab', primary: 'Tab', row: 2, width: 1.5 },
  { code: 'KeyQ', primary: 'Q', row: 2, width: 1 },
  { code: 'KeyW', primary: 'W', row: 2, width: 1 },
  { code: 'KeyE', primary: 'E', row: 2, width: 1 },
  { code: 'KeyR', primary: 'R', row: 2, width: 1 },
  { code: 'KeyT', primary: 'T', row: 2, width: 1 },
  { code: 'KeyY', primary: 'Y', row: 2, width: 1 },
  { code: 'KeyU', primary: 'U', row: 2, width: 1 },
  { code: 'KeyI', primary: 'I', row: 2, width: 1 },
  { code: 'KeyO', primary: 'O', row: 2, width: 1 },
  { code: 'KeyP', primary: 'P', row: 2, width: 1 },
  { code: 'BracketLeft', primary: '[', shift: '{', row: 2, width: 1 },
  { code: 'BracketRight', primary: ']', shift: '}', row: 2, width: 1 },
  { code: 'Backslash', primary: '\\', shift: '|', row: 2, width: 2.3 },

  // Row 3 - Home Row
  { code: 'CapsLock', primary: 'Caps', row: 3, width: 1.8 },
  { code: 'KeyA', primary: 'A', row: 3, width: 1 },
  { code: 'KeyS', primary: 'S', row: 3, width: 1 },
  { code: 'KeyD', primary: 'D', row: 3, width: 1 },
  { code: 'KeyF', primary: 'F', row: 3, width: 1 },
  { code: 'KeyG', primary: 'G', row: 3, width: 1 },
  { code: 'KeyH', primary: 'H', row: 3, width: 1 },
  { code: 'KeyJ', primary: 'J', row: 3, width: 1 },
  { code: 'KeyK', primary: 'K', row: 3, width: 1 },
  { code: 'KeyL', primary: 'L', row: 3, width: 1 },
  { code: 'Semicolon', primary: ';', shift: ':', row: 3, width: 1 },
  { code: 'Quote', primary: "'", shift: '"', row: 3, width: 1 },
  { code: 'Enter', primary: 'Enter', row: 3, width: 3.0 },

  // Row 4 - Bottom Letter Row
  { code: 'ShiftLeft', primary: 'Shift', row: 4, width: 2.3 },
  { code: 'KeyZ', primary: 'Z', row: 4, width: 1 },
  { code: 'KeyX', primary: 'X', row: 4, width: 1 },
  { code: 'KeyC', primary: 'C', row: 4, width: 1 },
  { code: 'KeyV', primary: 'V', row: 4, width: 1 },
  { code: 'KeyB', primary: 'B', row: 4, width: 1 },
  { code: 'KeyN', primary: 'N', row: 4, width: 1 },
  { code: 'KeyM', primary: 'M', row: 4, width: 1 },
  { code: 'Comma', primary: ',', shift: '<', row: 4, width: 1 },
  { code: 'Period', primary: '.', shift: '>', row: 4, width: 1 },
  { code: 'Slash', primary: '/', shift: '?', row: 4, width: 1 },
  { code: 'ShiftRight', primary: 'Shift', row: 4, width: 3.5 },

  // Row 5 - Modifier & Space Row
  { code: 'ControlLeft', primary: 'Ctrl', row: 5, width: 1.25 },
  { code: 'MetaLeft', primary: 'Win', row: 5, width: 1.25 },
  { code: 'AltLeft', primary: 'Alt', row: 5, width: 1.25 },
  { code: 'Space', primary: 'Space', row: 5, width: 6.25 },
  { code: 'AltRight', primary: 'Alt', row: 5, width: 1.25 },
  { code: 'MetaRight', primary: 'Win', row: 5, width: 1.25 },
  { code: 'ControlRight', primary: 'Ctrl', row: 5, width: 1.25 },
  { code: 'ArrowLeft', primary: '◄', row: 5, width: 0.85 },
  { code: 'ArrowUp', primary: '▲', row: 5, width: 0.85 },
  { code: 'ArrowDown', primary: '▼', row: 5, width: 0.85 },
  { code: 'ArrowRight', primary: '►', row: 5, width: 0.85 },
];

// ISO PT Layout (Portugal)
export const ISO_PT_KEYS: KeyDefinition[] = [
  // Row 0 - Function Row
  ...FUNCTION_ROW,

  // Row 1 - Number Row
  { code: 'Backquote', primary: '\\', shift: '|', row: 1, width: 1.2 },
  { code: 'Digit1', primary: '1', shift: '!', row: 1, width: 1 },
  { code: 'Digit2', primary: '2', shift: '"', altGr: '@', row: 1, width: 1 },
  { code: 'Digit3', primary: '3', shift: '#', altGr: '£', row: 1, width: 1 },
  { code: 'Digit4', primary: '4', shift: '$', altGr: '§', row: 1, width: 1 },
  { code: 'Digit5', primary: '5', shift: '%', row: 1, width: 1 },
  { code: 'Digit6', primary: '6', shift: '&', row: 1, width: 1 },
  { code: 'Digit7', primary: '7', shift: '/', altGr: '{', row: 1, width: 1 },
  { code: 'Digit8', primary: '8', shift: '(', altGr: '[', row: 1, width: 1 },
  { code: 'Digit9', primary: '9', shift: ')', altGr: ']', row: 1, width: 1 },
  { code: 'Digit0', primary: '0', shift: '=', altGr: '}', row: 1, width: 1 },
  { code: 'Minus', primary: '\'', shift: '?', row: 1, width: 1 },
  { code: 'Equal', primary: '«', shift: '»', row: 1, width: 1 },
  { code: 'Backspace', primary: 'Backspace', row: 1, width: 2.6 },

  // Row 2 - QWERTY Row
  { code: 'Tab', primary: 'Tab', row: 2, width: 1.5 },
  { code: 'KeyQ', primary: 'Q', row: 2, width: 1 },
  { code: 'KeyW', primary: 'W', row: 2, width: 1 },
  { code: 'KeyE', primary: 'E', altGr: '€', row: 2, width: 1 },
  { code: 'KeyR', primary: 'R', row: 2, width: 1 },
  { code: 'KeyT', primary: 'T', row: 2, width: 1 },
  { code: 'KeyY', primary: 'Y', row: 2, width: 1 },
  { code: 'KeyU', primary: 'U', row: 2, width: 1 },
  { code: 'KeyI', primary: 'I', row: 2, width: 1 },
  { code: 'KeyO', primary: 'O', row: 2, width: 1 },
  { code: 'KeyP', primary: 'P', row: 2, width: 1 },
  { code: 'BracketLeft', primary: '+', shift: '*', row: 2, width: 1 },
  { code: 'BracketRight', primary: '´', shift: '`', row: 2, width: 1 },
  { code: 'Enter', primary: 'Enter', row: 2, width: 2.3 },

  // Row 3 - Home Row
  { code: 'CapsLock', primary: 'Caps', row: 3, width: 1.8 },
  { code: 'KeyA', primary: 'A', row: 3, width: 1 },
  { code: 'KeyS', primary: 'S', row: 3, width: 1 },
  { code: 'KeyD', primary: 'D', row: 3, width: 1 },
  { code: 'KeyF', primary: 'F', row: 3, width: 1 },
  { code: 'KeyG', primary: 'G', row: 3, width: 1 },
  { code: 'KeyH', primary: 'H', row: 3, width: 1 },
  { code: 'KeyJ', primary: 'J', row: 3, width: 1 },
  { code: 'KeyK', primary: 'K', row: 3, width: 1 },
  { code: 'KeyL', primary: 'L', row: 3, width: 1 },
  { code: 'Semicolon', primary: 'Ç', row: 3, width: 1 },
  { code: 'Quote', primary: 'º', shift: 'ª', row: 3, width: 1 },
  { code: 'Backslash', primary: '~', shift: '^', row: 3, width: 2.0 },

  // Row 4 - Bottom Letter Row
  { code: 'ShiftLeft', primary: 'Shift', row: 4, width: 1.3 },
  { code: 'IntlBackslash', primary: '<', shift: '>', row: 4, width: 1 },
  { code: 'KeyZ', primary: 'Z', row: 4, width: 1 },
  { code: 'KeyX', primary: 'X', row: 4, width: 1 },
  { code: 'KeyC', primary: 'C', row: 4, width: 1 },
  { code: 'KeyV', primary: 'V', row: 4, width: 1 },
  { code: 'KeyB', primary: 'B', row: 4, width: 1 },
  { code: 'KeyN', primary: 'N', row: 4, width: 1 },
  { code: 'KeyM', primary: 'M', row: 4, width: 1 },
  { code: 'Comma', primary: ',', shift: ';', row: 4, width: 1 },
  { code: 'Period', primary: '.', shift: ':', row: 4, width: 1 },
  { code: 'Slash', primary: '-', shift: '_', row: 4, width: 1 },
  { code: 'ShiftRight', primary: 'Shift', row: 4, width: 2.5 },

  // Row 5 - Modifier & Space Row
  { code: 'ControlLeft', primary: 'Ctrl', row: 5, width: 1.25 },
  { code: 'MetaLeft', primary: 'Win', row: 5, width: 1.25 },
  { code: 'AltLeft', primary: 'Alt', row: 5, width: 1.25 },
  { code: 'Space', primary: 'Espaço', row: 5, width: 6.25 },
  { code: 'AltRight', primary: 'AltGr', row: 5, width: 1.25 },
  { code: 'MetaRight', primary: 'Win', row: 5, width: 1.25 },
  { code: 'ControlRight', primary: 'Ctrl', row: 5, width: 1.25 },
  { code: 'ArrowLeft', primary: '◄', row: 5, width: 0.85 },
  { code: 'ArrowUp', primary: '▲', row: 5, width: 0.85 },
  { code: 'ArrowDown', primary: '▼', row: 5, width: 0.85 },
  { code: 'ArrowRight', primary: '►', row: 5, width: 0.85 },
];

// AZERTY Layout (França)
export const AZERTY_KEYS: KeyDefinition[] = [
  // Row 0 - Function Row
  ...FUNCTION_ROW,

  // Row 1 - Number Row
  { code: 'Backquote', primary: '²', row: 1, width: 1.2 },
  { code: 'Digit1', primary: '&', shift: '1', row: 1, width: 1 },
  { code: 'Digit2', primary: 'é', shift: '2', altGr: '~', row: 1, width: 1 },
  { code: 'Digit3', primary: '"', shift: '3', altGr: '#', row: 1, width: 1 },
  { code: 'Digit4', primary: '\'', shift: '4', altGr: '{', row: 1, width: 1 },
  { code: 'Digit5', primary: '(', shift: '5', altGr: '[', row: 1, width: 1 },
  { code: 'Digit6', primary: '-', shift: '6', altGr: '|', row: 1, width: 1 },
  { code: 'Digit7', primary: 'è', shift: '7', altGr: '`', row: 1, width: 1 },
  { code: 'Digit8', primary: '_', shift: '8', altGr: '\\', row: 1, width: 1 },
  { code: 'Digit9', primary: 'ç', shift: '9', altGr: '^', row: 1, width: 1 },
  { code: 'Digit0', primary: 'à', shift: '0', altGr: '@', row: 1, width: 1 },
  { code: 'Minus', primary: ')', shift: '°', altGr: ']', row: 1, width: 1 },
  { code: 'Equal', primary: '=', shift: '+', altGr: '}', row: 1, width: 1 },
  { code: 'Backspace', primary: 'Backspace', row: 1, width: 2.6 },

  // Row 2 - QWERTY Row
  { code: 'Tab', primary: 'Tab', row: 2, width: 1.5 },
  { code: 'KeyA', primary: 'A', row: 2, width: 1 },
  { code: 'KeyZ', primary: 'Z', row: 2, width: 1 },
  { code: 'KeyE', primary: 'E', altGr: '€', row: 2, width: 1 },
  { code: 'KeyR', primary: 'R', row: 2, width: 1 },
  { code: 'KeyT', primary: 'T', row: 2, width: 1 },
  { code: 'KeyY', primary: 'Y', row: 2, width: 1 },
  { code: 'KeyU', primary: 'U', row: 2, width: 1 },
  { code: 'KeyI', primary: 'I', row: 2, width: 1 },
  { code: 'KeyO', primary: 'O', row: 2, width: 1 },
  { code: 'KeyP', primary: 'P', row: 2, width: 1 },
  { code: 'BracketLeft', primary: '^', shift: '¨', row: 2, width: 1 },
  { code: 'BracketRight', primary: '$', shift: '£', altGr: '¤', row: 2, width: 1 },
  { code: 'Enter', primary: 'Enter', row: 2, width: 2.3 },

  // Row 3 - Home Row
  { code: 'CapsLock', primary: 'Caps', row: 3, width: 1.8 },
  { code: 'KeyQ', primary: 'Q', row: 3, width: 1 },
  { code: 'KeyS', primary: 'S', row: 3, width: 1 },
  { code: 'KeyD', primary: 'D', row: 3, width: 1 },
  { code: 'KeyF', primary: 'F', row: 3, width: 1 },
  { code: 'KeyG', primary: 'G', row: 3, width: 1 },
  { code: 'KeyH', primary: 'H', row: 3, width: 1 },
  { code: 'KeyJ', primary: 'J', row: 3, width: 1 },
  { code: 'KeyK', primary: 'K', row: 3, width: 1 },
  { code: 'KeyL', primary: 'L', row: 3, width: 1 },
  { code: 'KeyM', primary: 'M', row: 3, width: 1 },
  { code: 'Quote', primary: 'ù', shift: '%', row: 3, width: 1 },
  { code: 'Backslash', primary: '*', shift: 'µ', row: 3, width: 2.0 },

  // Row 4 - Bottom Letter Row
  { code: 'ShiftLeft', primary: 'Shift', row: 4, width: 1.3 },
  { code: 'IntlBackslash', primary: '<', shift: '>', row: 4, width: 1 },
  { code: 'KeyW', primary: 'W', row: 4, width: 1 },
  { code: 'KeyX', primary: 'X', row: 4, width: 1 },
  { code: 'KeyC', primary: 'C', row: 4, width: 1 },
  { code: 'KeyV', primary: 'V', row: 4, width: 1 },
  { code: 'KeyB', primary: 'B', row: 4, width: 1 },
  { code: 'KeyN', primary: 'N', row: 4, width: 1 },
  { code: 'Comma', primary: ',', shift: '?', row: 4, width: 1 },
  { code: 'Period', primary: ';', shift: '.', row: 4, width: 1 },
  { code: 'Slash', primary: ':', shift: '/', row: 4, width: 1 },
  { code: 'IntlRo', primary: '!', shift: '§', row: 4, width: 1 },
  { code: 'ShiftRight', primary: 'Shift', row: 4, width: 2.5 },

  // Row 5 - Modifier & Space Row
  { code: 'ControlLeft', primary: 'Ctrl', row: 5, width: 1.25 },
  { code: 'MetaLeft', primary: 'Win', row: 5, width: 1.25 },
  { code: 'AltLeft', primary: 'Alt', row: 5, width: 1.25 },
  { code: 'Space', primary: 'Espace', row: 5, width: 6.25 },
  { code: 'AltRight', primary: 'AltGr', row: 5, width: 1.25 },
  { code: 'MetaRight', primary: 'Win', row: 5, width: 1.25 },
  { code: 'ControlRight', primary: 'Ctrl', row: 5, width: 1.25 },
  { code: 'ArrowLeft', primary: '◄', row: 5, width: 0.85 },
  { code: 'ArrowUp', primary: '▲', row: 5, width: 0.85 },
  { code: 'ArrowDown', primary: '▼', row: 5, width: 0.85 },
  { code: 'ArrowRight', primary: '►', row: 5, width: 0.85 },
];

// QWERTZ Layout (Alemanha/Áustria)
export const QWERTZ_KEYS: KeyDefinition[] = [
  // Row 0 - Function Row
  ...FUNCTION_ROW,

  // Row 1 - Number Row
  { code: 'Backquote', primary: '^', shift: '°', row: 1, width: 1.2 },
  { code: 'Digit1', primary: '1', shift: '!', row: 1, width: 1 },
  { code: 'Digit2', primary: '2', shift: '"', altGr: '²', row: 1, width: 1 },
  { code: 'Digit3', primary: '3', shift: '§', altGr: '³', row: 1, width: 1 },
  { code: 'Digit4', primary: '4', shift: '$', row: 1, width: 1 },
  { code: 'Digit5', primary: '5', shift: '%', row: 1, width: 1 },
  { code: 'Digit6', primary: '6', shift: '&', row: 1, width: 1 },
  { code: 'Digit7', primary: '7', shift: '/', altGr: '{', row: 1, width: 1 },
  { code: 'Digit8', primary: '8', shift: '(', altGr: '[', row: 1, width: 1 },
  { code: 'Digit9', primary: '9', shift: ')', altGr: ']', row: 1, width: 1 },
  { code: 'Digit0', primary: '0', shift: '=', altGr: '}', row: 1, width: 1 },
  { code: 'Minus', primary: 'ß', shift: '?', altGr: '\\', row: 1, width: 1 },
  { code: 'Equal', primary: '´', shift: '`', row: 1, width: 1 },
  { code: 'Backspace', primary: 'Backspace', row: 1, width: 2.6 },

  // Row 2 - QWERTZ Row
  { code: 'Tab', primary: 'Tab', row: 2, width: 1.5 },
  { code: 'KeyQ', primary: 'Q', altGr: '@', row: 2, width: 1 },
  { code: 'KeyW', primary: 'W', row: 2, width: 1 },
  { code: 'KeyE', primary: 'E', altGr: '€', row: 2, width: 1 },
  { code: 'KeyR', primary: 'R', row: 2, width: 1 },
  { code: 'KeyT', primary: 'T', row: 2, width: 1 },
  { code: 'KeyY', primary: 'Z', row: 2, width: 1 },
  { code: 'KeyU', primary: 'U', row: 2, width: 1 },
  { code: 'KeyI', primary: 'I', row: 2, width: 1 },
  { code: 'KeyO', primary: 'O', row: 2, width: 1 },
  { code: 'KeyP', primary: 'P', row: 2, width: 1 },
  { code: 'BracketLeft', primary: 'ü', row: 2, width: 1 },
  { code: 'BracketRight', primary: '+', shift: '*', altGr: '~', row: 2, width: 1 },
  { code: 'Enter', primary: 'Enter', row: 2, width: 2.3 },

  // Row 3 - Home Row
  { code: 'CapsLock', primary: 'Caps', row: 3, width: 1.8 },
  { code: 'KeyA', primary: 'A', row: 3, width: 1 },
  { code: 'KeyS', primary: 'S', row: 3, width: 1 },
  { code: 'KeyD', primary: 'D', row: 3, width: 1 },
  { code: 'KeyF', primary: 'F', row: 3, width: 1 },
  { code: 'KeyG', primary: 'G', row: 3, width: 1 },
  { code: 'KeyH', primary: 'H', row: 3, width: 1 },
  { code: 'KeyJ', primary: 'J', row: 3, width: 1 },
  { code: 'KeyK', primary: 'K', row: 3, width: 1 },
  { code: 'KeyL', primary: 'L', row: 3, width: 1 },
  { code: 'Semicolon', primary: 'ö', row: 3, width: 1 },
  { code: 'Quote', primary: 'ä', row: 3, width: 1 },
  { code: 'Backslash', primary: '#', shift: '\'', row: 3, width: 2.0 },

  // Row 4 - Bottom Letter Row
  { code: 'ShiftLeft', primary: 'Shift', row: 4, width: 1.3 },
  { code: 'IntlBackslash', primary: '<', shift: '>', altGr: '|', row: 4, width: 1 },
  { code: 'KeyZ', primary: 'Y', row: 4, width: 1 },
  { code: 'KeyX', primary: 'X', row: 4, width: 1 },
  { code: 'KeyC', primary: 'C', row: 4, width: 1 },
  { code: 'KeyV', primary: 'V', row: 4, width: 1 },
  { code: 'KeyB', primary: 'B', row: 4, width: 1 },
  { code: 'KeyN', primary: 'N', row: 4, width: 1 },
  { code: 'KeyM', primary: 'M', altGr: 'µ', row: 4, width: 1 },
  { code: 'Comma', primary: ',', shift: ';', row: 4, width: 1 },
  { code: 'Period', primary: '.', shift: ':', row: 4, width: 1 },
  { code: 'Slash', primary: '-', shift: '_', row: 4, width: 1 },
  { code: 'ShiftRight', primary: 'Shift', row: 4, width: 2.5 },

  // Row 5 - Modifier & Space Row
  { code: 'ControlLeft', primary: 'Ctrl', row: 5, width: 1.25 },
  { code: 'MetaLeft', primary: 'Win', row: 5, width: 1.25 },
  { code: 'AltLeft', primary: 'Alt', row: 5, width: 1.25 },
  { code: 'Space', primary: 'Leertaste', row: 5, width: 6.25 },
  { code: 'AltRight', primary: 'AltGr', row: 5, width: 1.25 },
  { code: 'MetaRight', primary: 'Win', row: 5, width: 1.25 },
  { code: 'ControlRight', primary: 'Ctrl', row: 5, width: 1.25 },
  { code: 'ArrowLeft', primary: '◄', row: 5, width: 0.85 },
  { code: 'ArrowUp', primary: '▲', row: 5, width: 0.85 },
  { code: 'ArrowDown', primary: '▼', row: 5, width: 0.85 },
  { code: 'ArrowRight', primary: '►', row: 5, width: 0.85 },
];

export function getLayoutKeys(layout: KeyboardLayoutType): KeyDefinition[] {
  switch (layout) {
    case 'ABNT2':
      return ABNT2_KEYS;
    case 'ANSI':
      return ANSI_KEYS;
    case 'ISO_PT':
      return ISO_PT_KEYS;
    case 'AZERTY':
      return AZERTY_KEYS;
    case 'QWERTZ':
      return QWERTZ_KEYS;
    default:
      return ABNT2_KEYS;
  }
}

// Dedicated 100% Full-Size Numpad (Bloco Numérico Físico)
export const NUMPAD_KEYS: KeyDefinition[] = [
  // Row 0 - Control row
  { code: 'NumLock', primary: 'Num', row: 0, width: 1 },
  { code: 'NumpadDivide', primary: '/', row: 0, width: 1 },
  { code: 'NumpadMultiply', primary: '*', row: 0, width: 1 },
  { code: 'NumpadSubtract', primary: '-', row: 0, width: 1 },

  // Row 1
  { code: 'Numpad7', primary: '7', row: 1, width: 1 },
  { code: 'Numpad8', primary: '8', row: 1, width: 1 },
  { code: 'Numpad9', primary: '9', row: 1, width: 1 },
  { code: 'NumpadAdd', primary: '+', row: 1, width: 1 },

  // Row 2
  { code: 'Numpad4', primary: '4', row: 2, width: 1 },
  { code: 'Numpad5', primary: '5', row: 2, width: 1 },
  { code: 'Numpad6', primary: '6', row: 2, width: 1 },

  // Row 3
  { code: 'Numpad1', primary: '1', row: 3, width: 1 },
  { code: 'Numpad2', primary: '2', row: 3, width: 1 },
  { code: 'Numpad3', primary: '3', row: 3, width: 1 },
  { code: 'NumpadEnter', primary: 'Enter', row: 3, width: 1 },

  // Row 4
  { code: 'Numpad0', primary: '0', row: 4, width: 2 },
  { code: 'NumpadDecimal', primary: '.', shift: ',', row: 4, width: 1 },
  { code: 'NumpadComma', primary: ',', row: 4, width: 1 },
];

export function isNumpadCode(code: string): boolean {
  return code.startsWith('Numpad') || code === 'NumLock';
}

