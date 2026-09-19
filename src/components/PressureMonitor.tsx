import React from 'react';
import { SwitchDiagnosticState } from '../types';
import { Activity, AlertTriangle, CheckCircle2, Clock, Gauge, Zap } from 'lucide-react';

interface PressureMonitorProps {
  spaceSwitch?: SwitchDiagnosticState;
  lastActiveSwitch?: SwitchDiagnosticState;
  minBounceMs: number | null;
  avgBounceMs: number | null;
}

export const PressureMonitor: React.FC<PressureMonitorProps> = ({
  spaceSwitch,
  lastActiveSwitch,
  minBounceMs,
  avgBounceMs,
}) => {
  // Target monitored key: focus on Space or the last pressed key
  const monitored = spaceSwitch?.isPressed || (spaceSwitch && spaceSwitch.pressCount > 0)
    ? spaceSwitch
    : lastActiveSwitch || spaceSwitch;

  const currentHoldMs = monitored?.isPressed ? Math.round(monitored.currentHoldDurationMs) : 0;
  const maxHoldMs = monitored ? Math.round(monitored.maxHoldDurationMs) : 0;
  const shortestBounce = monitored?.shortestBounceMs;
  const hasAnomaly = !!monitored?.hasAnomaly;
  const isChatteringRisk = shortestBounce !== null && shortestBounce !== undefined && shortestBounce < 130;

  // Visual gauge progress up to 2000ms
  const holdPercentage = Math.min(100, (currentHoldMs / 2000) * 100);

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 p-3 sm:p-4 rounded-xl shadow-xl w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-100 font-mono flex items-center gap-2">
              Monitor de Pressão Contínua & Anti-Chattering
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                Limiar Crítico: &lt; 130ms
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Mede a sustentação contínua do switch mecânico sem micro-desconexões da palheta condutora.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {hasAnomaly ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse font-mono">
              <AlertTriangle className="w-3.5 h-3.5" />
              Alerta de Chattering Detectado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sinal Estável
            </span>
          )}
        </div>
      </div>

      {/* Main Diagnostic Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
        {/* Gauge 1: Monitored Key & Current Continuous Hold */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Alvo em Análise:</span>
            <span className="text-cyan-400 font-bold">{monitored?.displayName || 'Espaço (Space)'}</span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-2xl font-bold text-white tracking-tight">
                {currentHoldMs} <span className="text-xs font-normal text-slate-400">ms</span>
              </span>
              <span className="text-xs text-slate-400">
                Pico: <strong className="text-slate-200">{maxHoldMs} ms</strong>
              </span>
            </div>

            {/* Hold progress timeline bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-75 ${
                  monitored?.isPressed
                    ? hasAnomaly
                      ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                      : 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
                    : 'bg-slate-600'
                }`}
                style={{ width: `${monitored?.isPressed ? Math.max(5, holdPercentage) : 0}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" /> Estado:
            </span>
            <span className={monitored?.isPressed ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {monitored?.isPressed ? 'CONTATO FECHADO' : 'CIRCUITO ABERTO'}
            </span>
          </div>
        </div>

        {/* Gauge 2: Debounce & Chattering Interval */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Menor Intervalo (Bounce):</span>
            <span className="text-slate-400 text-[10px]">Normal: &gt; 130ms</span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline justify-between font-mono">
              <span
                className={`text-2xl font-bold tracking-tight ${
                  shortestBounce === null || shortestBounce === undefined
                    ? 'text-slate-500'
                    : isChatteringRisk
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {shortestBounce !== null && shortestBounce !== undefined ? `${Math.round(shortestBounce)}` : '--'}
                <span className="text-xs font-normal text-slate-400 ml-1">ms</span>
              </span>
              <span className="text-xs text-slate-400">
                Média Geral:{' '}
                <strong className="text-slate-200">{avgBounceMs ? `${avgBounceMs} ms` : '--'}</strong>
              </span>
            </div>

            {/* Visual Risk Indicator Bar */}
            <div className="flex items-center gap-1 mt-2">
              <div
                className={`flex-1 h-1.5 rounded-sm ${
                  isChatteringRisk ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]' : 'bg-slate-800'
                }`}
                title="Zona de Chattering (&lt; 130ms)"
              />
              <div
                className={`flex-1 h-1.5 rounded-sm ${
                  shortestBounce && shortestBounce >= 130 && shortestBounce < 200 ? 'bg-amber-500' : 'bg-slate-800'
                }`}
                title="Zona de Transição (130ms - 200ms)"
              />
              <div
                className={`flex-1 h-1.5 rounded-sm ${
                  shortestBounce && shortestBounce >= 200 ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
                title="Zona Segura (&gt; 200ms)"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Avaliação:</span>
            <span
              className={`font-semibold ${
                isChatteringRisk ? 'text-rose-400' : shortestBounce ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {isChatteringRisk ? 'FALSO CONTATO / CHATTERING' : shortestBounce ? 'CONTATO LIMPO' : 'AGUARDANDO REPIQUE'}
            </span>
          </div>
        </div>

        {/* Gauge 3: Anomaly Statistics & Test Instructions */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span>Total de Oscilações Anômalas:</span>
            <span className="font-bold text-rose-400">{monitored?.anomalyCount || 0}</span>
          </div>

          <div className="my-1 text-[11px] text-slate-300 space-y-1">
            <p className="flex items-center gap-1.5 text-cyan-300">
              <Zap className="w-3 h-3 shrink-0" />
              <strong>Teste de Perda de Pressão:</strong>
            </p>
            <p className="text-slate-400 leading-tight">
              Pressione e mantenha a <strong>Barra de Espaço</strong> acionada suavemente. Se a barra oscilar ou desarmar involuntariamente, há folga no estabilizador ou mola fadigada.
            </p>
          </div>

          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
            Mínimo registrado no sistema: <strong className="text-slate-300">{minBounceMs ? `${minBounceMs}ms` : '--'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
