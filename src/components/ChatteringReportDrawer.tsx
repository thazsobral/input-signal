import React from 'react';
import { SwitchDiagnosticState } from '../types';
import {
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Percent,
  Timer,
  BarChart3,
} from 'lucide-react';

interface ChatteringReportDrawerProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  switches: Record<string, SwitchDiagnosticState>;
  chatteringCount: number;
  minBounceMs: number | null;
  avgBounceMs: number | null;
}

export const ChatteringReportDrawer: React.FC<ChatteringReportDrawerProps> = ({
  isExpanded,
  onToggleExpand,
  switches,
  chatteringCount,
  minBounceMs,
  avgBounceMs,
}) => {
  // Sort switches with anomalies first, then by press count
  const allSwitches = Object.values(switches).filter((s) => s.pressCount > 0);
  const switchesWithAnomalies = allSwitches.filter((s) => s.hasAnomaly);
  const sortedSwitches = [...allSwitches].sort((a, b) => {
    if (b.anomalyCount !== a.anomalyCount) return b.anomalyCount - a.anomalyCount;
    return b.pressCount - a.pressCount;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl shadow-xl overflow-hidden transition-all duration-200">
      {/* Collapsible Header Summary Banner */}
      <div
        onClick={onToggleExpand}
        className="px-4 py-3 bg-slate-900 hover:bg-slate-850 cursor-pointer flex items-center justify-between select-none border-b border-slate-800/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-100 font-mono">
                Relatório Técnico de Chattering & Degradação de Switch
              </span>
              {chatteringCount > 0 ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {chatteringCount} repiques detectados
                </span>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 100% Switches Saudáveis
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {isExpanded
                ? 'Painel expandido — detalhamento de tempo de oscilação da palheta e diagnósticos elétricos.'
                : 'Clique para expandir o inventário de saúde mecânica dos contatos.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            {isExpanded ? 'Recolher Painel' : 'Expandir'}
          </span>
          <div className="p-1 rounded-md bg-slate-800 text-slate-300">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-3 sm:p-4 flex flex-col gap-3">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400">Switches Testados:</span>
              <div className="text-xl font-bold text-white mt-0.5">{allSwitches.length}</div>
              <span className="text-[10px] text-slate-500">Matriz física ativa</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400">Switches com Falha:</span>
              <div className={`text-xl font-bold mt-0.5 ${switchesWithAnomalies.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {switchesWithAnomalies.length}
              </div>
              <span className="text-[10px] text-slate-500">Repique &lt; 130ms</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400">Menor Bounce Registrado:</span>
              <div className={`text-xl font-bold mt-0.5 ${minBounceMs && minBounceMs < 130 ? 'text-rose-400' : 'text-slate-200'}`}>
                {minBounceMs !== null ? `${Math.round(minBounceMs)}ms` : '--'}
              </div>
              <span className="text-[10px] text-slate-500">Normalidade: &gt; 130ms</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400">Média de Intervalo:</span>
              <div className="text-xl font-bold text-cyan-400 mt-0.5">
                {avgBounceMs !== null ? `${avgBounceMs}ms` : '--'}
              </div>
              <span className="text-[10px] text-slate-500">Tempo de debounce</span>
            </div>
          </div>

          {/* List of Keys Monitored */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 overflow-hidden font-mono text-xs">
            <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 font-semibold text-slate-300 flex items-center justify-between">
              <span>Classificação de Integridade dos Switches</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Ordenado por anomalias e número de acionamentos
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-850">
              {sortedSwitches.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  Nenhum acionamento registrado ainda. Pressione teclas para alimentar o gráfico de integridade.
                </div>
              ) : (
                sortedSwitches.map((s) => (
                  <div
                    key={s.code}
                    className={`px-3 py-2 flex items-center justify-between gap-3 hover:bg-slate-900/50 transition ${
                      s.hasAnomaly ? 'bg-rose-950/15' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-20 font-bold text-white">{s.displayName}</span>
                      <span className="text-[10px] text-slate-500">({s.code})</span>
                    </div>

                    <div className="flex items-center gap-4 text-slate-300">
                      <div>
                        Acionamentos: <strong className="text-white">{s.pressCount}x</strong>
                      </div>
                      <div>
                        Menor Repique:{' '}
                        <strong
                          className={
                            s.shortestBounceMs !== null && s.shortestBounceMs < 130
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }
                        >
                          {s.shortestBounceMs !== null ? `${Math.round(s.shortestBounceMs)}ms` : '--'}
                        </strong>
                      </div>
                      <div>
                        Maior Sustentação:{' '}
                        <strong className="text-cyan-300">{Math.round(s.maxHoldDurationMs)}ms</strong>
                      </div>
                    </div>

                    <div>
                      {s.hasAnomaly ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <AlertTriangle className="w-2.5 h-2.5" /> {s.anomalyCount} Repiques
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Íntegro
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Technical Diagnostics & Maintenance Recommendation */}
          <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-300 flex items-start gap-3">
            <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-0.5">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h5 className="font-semibold text-slate-100 flex items-center gap-2">
                Guia Técnico de Resolução (Switch Chattering & Falso Contato)
              </h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                1. <strong>Oxidação ou Poeira:</strong> O repique anômalo (&lt; 130ms) é tipicamente provocado por acúmulo de partículas na lâmina condutora de bronze/ouro do switch mecânico. Aplique álcool isopropílico 99% ou limpa-contatos elétrico de rápida secagem.
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                2. <strong>Fadiga da Mola / Folga no Estabilizador:</strong> Caso a Barra de Espaço apresente interrupção durante a pressão contínua, verifique o arame do estabilizador e as presilhas na PCB.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
