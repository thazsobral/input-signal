import React from 'react';
import { KeyboardLayoutType, SwitchDiagnosticState } from '../types';
import { getLayoutKeys, NUMPAD_KEYS } from '../utils/keyboardLayouts';
import { AlertTriangle, Clock, Zap, Calculator, CheckCircle2 } from 'lucide-react';

interface KeyboardWorkbenchProps {
  layout: KeyboardLayoutType;
  switches: Record<string, SwitchDiagnosticState>;
  lastActiveCode: string | null;
  activeCount: number;
  hasNumpadDetected: boolean;
  showNumpad: boolean;
  onToggleNumpad: () => void;
}

export const KeyboardWorkbench: React.FC<KeyboardWorkbenchProps> = ({
  layout,
  switches,
  lastActiveCode,
  activeCount,
  hasNumpadDetected,
  showNumpad,
  onToggleNumpad,
}) => {
  const keys = getLayoutKeys(layout);

  // Group keys by row (0 to 5, including Function Row)
  const maxRow = keys.reduce((max, k) => Math.max(max, k.row), 0);
  const rows = Array.from({ length: maxRow + 1 }, (_, r) => keys.filter((k) => k.row === r));

  // Group numpad keys by row (0 to 4)
  const numpadRows = [0, 1, 2, 3, 4].map((r) => NUMPAD_KEYS.filter((k) => k.row === r));

  const spaceState = switches['Space'];

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Top Header of Keyboard Workbench */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Matriz de Switches ({layout})
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {activeCount > 0 ? (
              <span className="text-cyan-400 font-bold">{activeCount} tecla(s) acionada(s)</span>
            ) : (
              'Aguardando entrada física'
            )}
          </span>

          {/* Numpad Hardware Auto-Detection Badge */}
          {hasNumpadDetected ? (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Teclado Numérico Físico Detectado
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60 font-mono">
              <Calculator className="w-3 h-3 text-slate-500" /> Teclado Numérico: Toque para auto-detectar
            </span>
          )}
        </div>

        {/* Numpad Toggle & Spacebar Quick Monitor Pill */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleNumpad}
            className={`flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md border transition cursor-pointer ${
              showNumpad
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="Alternar entre formato Tenkeyless (TKL) e Teclado Completo (100% com Numpad)"
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showNumpad ? '100% (Numpad Ativo)' : 'TKL (Ocultar Numpad)'}</span>
          </button>

          {spaceState && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
              <span className="text-slate-400">Espaço:</span>
              <span className={spaceState.isPressed ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                {spaceState.isPressed ? `${Math.round(spaceState.currentHoldDurationMs)}ms` : `${spaceState.pressCount}x`}
              </span>
              {spaceState.hasAnomaly && (
                <span className="flex items-center gap-0.5 text-rose-400 font-bold bg-rose-500/10 px-1 rounded">
                  <AlertTriangle className="w-3 h-3" /> Chattering ({spaceState.anomalyCount})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vector Keyboard Frame */}
      <div className="bg-slate-900/90 border border-slate-800/90 p-2 sm:p-3 rounded-xl shadow-xl overflow-x-auto select-none">
        <div className="flex gap-3 min-w-[700px] w-full">
          {/* Main Alphanumeric & Function Layout */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[660px]">
            {rows.map((rowKeys, rowIndex) => (
              <div
                key={rowIndex}
                className={`flex gap-1 w-full ${
                  rowIndex === 0 ? 'pb-1 mb-0.5 border-b border-slate-800/60' : ''
                }`}
              >
                {rowKeys.map((keyDef) => {
                  const switchState = switches[keyDef.code];
                  const isPressed = !!switchState?.isPressed;
                  const hasAnomaly = !!switchState?.hasAnomaly;
                  const pressCount = switchState?.pressCount || 0;
                  const isLastActive = lastActiveCode === keyDef.code;

                  // Width calculation in flex flex-grow
                  const flexGrow = keyDef.width || 1;

                  return (
                    <div
                      key={`${keyDef.code}-${rowIndex}`}
                      id={`key-${keyDef.code}`}
                      style={{ flex: `${flexGrow} 0 0%` }}
                      className={`relative rounded-md transition-all duration-75 flex flex-col justify-between p-1 border font-mono ${
                        rowIndex === 0
                          ? 'min-h-[36px] sm:min-h-[40px]'
                          : 'min-h-[46px] sm:min-h-[50px]'
                      } ${
                        isPressed
                          ? hasAnomaly
                            ? 'bg-rose-500/30 border-rose-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)] translate-y-0.5'
                            : 'bg-cyan-500/30 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)] translate-y-0.5'
                          : hasAnomaly
                          ? 'bg-rose-950/40 border-rose-600/70 text-rose-200'
                          : isLastActive
                          ? 'bg-slate-800/90 border-cyan-500/50 text-slate-100 shadow-sm'
                          : pressCount > 0
                          ? 'bg-slate-800/60 border-slate-700/80 text-slate-200'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Row: Shift label & AltGr label */}
                      <div className="flex justify-between items-start text-[10px] leading-none opacity-80">
                        <span className="text-cyan-300/90 font-medium">{keyDef.shift || ''}</span>
                        <span className="text-amber-300/80 font-medium text-[9px]">{keyDef.altGr || ''}</span>
                      </div>

                      {/* Center Row: Primary Key Label */}
                      <div className="flex items-center justify-center py-0.5">
                        <span
                          className={`font-semibold tracking-tight leading-none text-center ${
                            keyDef.code === 'Space'
                              ? 'text-xs text-slate-300'
                              : keyDef.primary.length > 3
                              ? 'text-[10px] sm:text-xs'
                              : 'text-xs sm:text-sm'
                          } ${isPressed ? 'text-white' : ''}`}
                        >
                          {keyDef.code === 'Space' ? (
                            isPressed ? (
                              <span className="text-cyan-300 flex items-center gap-1">
                                <Clock className="w-3 h-3 animate-spin" /> {Math.round(switchState?.currentHoldDurationMs || 0)}ms
                              </span>
                            ) : (
                              'Barra de Espaço'
                            )
                          ) : (
                            keyDef.primary
                          )}
                        </span>
                      </div>

                      {/* Bottom Row: Press count & Anomaly indicator */}
                      <div className="flex justify-between items-end text-[9px] leading-none">
                        {pressCount > 0 ? (
                          <span
                            className={`px-1 py-0.2 rounded font-mono ${
                              isPressed ? 'bg-cyan-900/80 text-cyan-200' : 'bg-slate-900/60 text-slate-400'
                            }`}
                          >
                            {pressCount}
                          </span>
                        ) : (
                          <span />
                        )}

                        {hasAnomaly && (
                          <span
                            title={`Oscilação anômala (<130ms) detectada ${switchState?.anomalyCount}x!`}
                            className="flex items-center gap-0.5 text-rose-400 font-bold bg-rose-950/80 px-1 py-0.2 rounded border border-rose-500/40"
                          >
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>{switchState?.anomalyCount}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Optional 100% Full-Size Numpad Island */}
          {showNumpad && (
            <div className="flex flex-col gap-1.5 w-44 sm:w-48 pl-3 border-l border-slate-800/80 shrink-0">
              <div className="pb-1 mb-0.5 border-b border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Calculator className="w-3 h-3 text-cyan-400" /> Numpad
                </span>
                {hasNumpadDetected ? (
                  <span className="text-emerald-400 text-[10px]">Ativo</span>
                ) : (
                  <span className="text-slate-500 text-[9px]">Aguardando</span>
                )}
              </div>

              {numpadRows.map((nRowKeys, nRowIndex) => (
                <div key={`numpad-row-${nRowIndex}`} className="flex gap-1 w-full">
                  {nRowKeys.map((keyDef) => {
                    const switchState = switches[keyDef.code];
                    const isPressed = !!switchState?.isPressed;
                    const hasAnomaly = !!switchState?.hasAnomaly;
                    const pressCount = switchState?.pressCount || 0;
                    const isLastActive = lastActiveCode === keyDef.code;
                    const flexGrow = keyDef.width || 1;

                    return (
                      <div
                        key={`numpad-${keyDef.code}`}
                        id={`key-${keyDef.code}`}
                        style={{ flex: `${flexGrow} 0 0%` }}
                        className={`relative min-h-[46px] sm:min-h-[50px] rounded-md transition-all duration-75 flex flex-col justify-between p-1 border font-mono ${
                          isPressed
                            ? hasAnomaly
                              ? 'bg-rose-500/30 border-rose-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.6)] translate-y-0.5'
                              : 'bg-cyan-500/30 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)] translate-y-0.5'
                            : hasAnomaly
                            ? 'bg-rose-950/40 border-rose-600/70 text-rose-200'
                            : isLastActive
                            ? 'bg-slate-800/90 border-cyan-500/50 text-slate-100 shadow-sm'
                            : pressCount > 0
                            ? 'bg-slate-800/60 border-slate-700/80 text-slate-200'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start text-[9px] leading-none opacity-80">
                          <span className="text-cyan-300/90 font-medium">{keyDef.shift || ''}</span>
                        </div>

                        <div className="flex items-center justify-center py-0.5">
                          <span
                            className={`font-semibold tracking-tight leading-none text-center text-xs sm:text-sm ${
                              isPressed ? 'text-white' : ''
                            }`}
                          >
                            {keyDef.primary}
                          </span>
                        </div>

                        <div className="flex justify-between items-end text-[9px] leading-none">
                          {pressCount > 0 ? (
                            <span
                              className={`px-1 py-0.2 rounded font-mono ${
                                isPressed ? 'bg-cyan-900/80 text-cyan-200' : 'bg-slate-900/60 text-slate-400'
                              }`}
                            >
                              {pressCount}
                            </span>
                          ) : (
                            <span />
                          )}

                          {hasAnomaly && (
                            <span
                              title={`Oscilação anômala detectada ${switchState?.anomalyCount}x!`}
                              className="flex items-center gap-0.5 text-rose-400 font-bold bg-rose-950/80 px-1 py-0.2 rounded border border-rose-500/40"
                            >
                              <AlertTriangle className="w-2 h-2" />
                              <span>{switchState?.anomalyCount}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

