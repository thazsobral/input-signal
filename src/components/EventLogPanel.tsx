import React, { useState, useRef, useEffect } from 'react';
import { InputEventRecord } from '../types';
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  Copy,
  Download,
  Check,
  Filter,
  AlertTriangle,
  ArrowDownToLine,
  Search,
  ListFilter,
  Terminal,
} from 'lucide-react';

interface EventLogPanelProps {
  events: InputEventRecord[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  totalEvents: number;
  anomalyCount: number;
  onExportJson: () => void;
  onExportCsv?: () => void;
  isExporting?: boolean;
}

export const EventLogPanel: React.FC<EventLogPanelProps> = ({
  events,
  isExpanded,
  onToggleExpand,
  isPaused,
  onTogglePause,
  totalEvents,
  anomalyCount,
  onExportJson,
  onExportCsv,
  isExporting = false,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'keyboard' | 'mouse' | 'anomalies'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && isExpanded && scrollRef.current && !isPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, autoScroll, isExpanded, isPaused]);

  // Filter events
  const filteredEvents = events.filter((ev) => {
    if (filterTab === 'keyboard' && ev.source !== 'keyboard') return false;
    if (filterTab === 'mouse' && ev.source !== 'mouse') return false;
    if (filterTab === 'anomalies' && !ev.isAnomaly) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ev.code.toLowerCase().includes(q) ||
        ev.displayName.toLowerCase().includes(q) ||
        ev.type.toLowerCase().includes(q) ||
        (ev.anomalyDetails && ev.anomalyDetails.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Copy to clipboard formatted
  const handleCopy = () => {
    if (filteredEvents.length === 0) return;
    const header = 'TIMESTAMP\tACTION\tSOURCE\tKEY/BUTTON\tHOLD_MS\tSTATUS\tDETAILS\n';
    const rows = filteredEvents
      .map(
        (e) =>
          `${e.formattedTime}\t${e.type}\t${e.source}\t${e.displayName}\t${
            e.durationMs ? `${Math.round(e.durationMs)}ms` : '-'
          }\t${e.isAnomaly ? 'ANOMALIA' : 'OK'}\t${e.anomalyDetails || '-'}`
      )
      .join('\n');

    navigator.clipboard.writeText(header + rows).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl shadow-xl overflow-hidden transition-all duration-200">
      {/* Collapsible Header Summary Banner (Always visible) */}
      <div
        onClick={onToggleExpand}
        className="px-4 py-3 bg-slate-900 hover:bg-slate-850 cursor-pointer flex items-center justify-between select-none border-b border-slate-800/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-100 font-mono">
                Registro de Eventos em Tempo Real (Log Stream)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {totalEvents} eventos gravados
              </span>
              {anomalyCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {anomalyCount} anomalia(s)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {isExpanded
                ? 'Painel expandido — análise detalhada por timestamp com milissegundos.'
                : 'Clique para expandir a tabela completa de inspeção técnica.'}
            </p>
          </div>
        </div>

        {/* Toggle Arrow */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            {isExpanded ? 'Recolher Painel' : 'Expandir'}
          </span>
          <button
            type="button"
            className="p-1 rounded-md bg-slate-800 text-slate-300 hover:text-white"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-3 sm:p-4 flex flex-col gap-3">
          {/* Sub-toolbar: Tabs, Search, Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${
                  filterTab === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos ({totalEvents})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('keyboard')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${
                  filterTab === 'keyboard' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Teclado
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('mouse')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${
                  filterTab === 'mouse' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mouse
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('anomalies')}
                className={`px-2.5 py-1 rounded cursor-pointer transition flex items-center gap-1 ${
                  filterTab === 'anomalies'
                    ? 'bg-rose-500/25 text-rose-300 font-bold'
                    : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                Chattering ({anomalyCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs min-w-[160px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por tecla, ação..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Action buttons: Pause, Auto-scroll, Copy, Export */}
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <button
                type="button"
                onClick={onTogglePause}
                title={isPaused ? 'Retomar captura ao vivo' : 'Pausar fluxo de eventos'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  isPaused
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {isPaused ? <Play className="w-3 h-3 text-amber-400" /> : <Pause className="w-3 h-3" />}
                <span className="hidden sm:inline">{isPaused ? 'Retomar' : 'Pausar'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAutoScroll(!autoScroll)}
                title="Rolar automaticamente para novos eventos"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  autoScroll
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-semibold'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownToLine className="w-3 h-3" />
                <span className="hidden sm:inline">Auto-scroll</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                title="Copiar dados da tabela para a área de transferência"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>

              <button
                type="button"
                onClick={onExportJson}
                disabled={isExporting}
                title="Exportar histórico diagnóstico completo em formato JSON"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Download className="w-3 h-3" />
                <span>{isExporting ? 'Exportando...' : 'Exportar JSON'}</span>
              </button>

              {onExportCsv && (
                <button
                  type="button"
                  onClick={onExportCsv}
                  disabled={isExporting}
                  title="Exportar histórico de eventos em formato CSV para Excel/Planilhas"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-3 h-3" />
                  <span>Exportar CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div
            ref={scrollRef}
            className="overflow-x-auto max-h-72 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/80 font-mono text-xs"
          >
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/95 sticky top-0 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider select-none z-10">
                <tr>
                  <th className="py-2 px-3">Timestamp (ms)</th>
                  <th className="py-2 px-3">Ação</th>
                  <th className="py-2 px-3">Origem</th>
                  <th className="py-2 px-3">Tecla / Botão</th>
                  <th className="py-2 px-3">Sustentação</th>
                  <th className="py-2 px-3">Intervalo (Delta)</th>
                  <th className="py-2 px-3">Status de Contato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                      Nenhum evento registrado no filtro atual. Pressione teclas ou botões para capturar sinais em tempo real.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => (
                    <tr
                      key={ev.id}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        ev.isAnomaly ? 'bg-rose-950/20 text-rose-200' : ''
                      }`}
                    >
                      <td className="py-1.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {ev.formattedTime}
                      </td>
                      <td className="py-1.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            ev.type === 'keydown' || ev.type === 'mousedown'
                              ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-800'
                              : ev.type === 'wheel'
                              ? 'bg-amber-900/50 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {ev.type}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-slate-400 whitespace-nowrap">
                        {ev.source === 'keyboard' ? 'Teclado' : 'Mouse'}
                      </td>
                      <td className="py-1.5 px-3 font-semibold text-white whitespace-nowrap">
                        {ev.displayName}
                        <span className="text-[10px] text-slate-500 font-normal ml-1">({ev.code})</span>
                      </td>
                      <td className="py-1.5 px-3 text-slate-300 whitespace-nowrap">
                        {ev.durationMs ? `${Math.round(ev.durationMs)} ms` : '--'}
                      </td>
                      <td className="py-1.5 px-3 text-slate-300 whitespace-nowrap font-mono">
                        {ev.deltaMs !== undefined ? (
                          <span
                            className={
                              ev.deltaMs < 130 ? 'text-rose-400 font-bold' : 'text-slate-400'
                            }
                          >
                            {Math.round(ev.deltaMs)} ms
                          </span>
                        ) : (
                          '--'
                        )}
                      </td>
                      <td className="py-1.5 px-3 whitespace-nowrap">
                        {ev.isAnomaly ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {ev.anomalyDetails || 'Chattering (<130ms)'}
                          </span>
                        ) : (
                          <span className="text-emerald-400/90 text-[11px]">Normal</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
