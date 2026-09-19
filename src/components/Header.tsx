import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  RotateCcw,
  Download,
  ChevronDown,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import { KeyboardLayoutType } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  layout: KeyboardLayoutType;
  onLayoutChange: (layout: KeyboardLayoutType) => void;
  detectedLayout: KeyboardLayoutType;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onClearHistory: () => void;
  onExportLogs: (format: 'json' | 'csv') => void;
  totalAnomalies: number;
}

export const Header: React.FC<HeaderProps> = ({
  layout,
  onLayoutChange,
  detectedLayout,
  soundEnabled,
  onToggleSound,
  isDarkMode,
  onToggleTheme,
  onClearHistory,
  onExportLogs,
  totalAnomalies,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white font-mono">
                input<span className="text-cyan-400">-signal</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                RAW 0ms
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Bancada de Diagnóstico de Periféricos & Switches
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Keyboard layout selector */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5 text-xs font-mono">
            <span className="px-2 text-slate-400 text-[11px] hidden md:inline">Layout:</span>
            <select
              id="layout-selector"
              value={layout}
              onChange={(e) => onLayoutChange(e.target.value as KeyboardLayoutType)}
              className="bg-transparent text-slate-200 text-xs font-medium px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="ABNT2" className="bg-slate-900 text-slate-100">
                ABNT2 (Brasil - Ç) {detectedLayout === 'ABNT2' ? '★' : ''}
              </option>
              <option value="ANSI" className="bg-slate-900 text-slate-100">
                ANSI (US) {detectedLayout === 'ANSI' ? '★' : ''}
              </option>
              <option value="ISO_PT" className="bg-slate-900 text-slate-100">
                ISO (Portugal) {detectedLayout === 'ISO_PT' ? '★' : ''}
              </option>
              <option value="AZERTY" className="bg-slate-900 text-slate-100">
                AZERTY (França) {detectedLayout === 'AZERTY' ? '★' : ''}
              </option>
              <option value="QWERTZ" className="bg-slate-900 text-slate-100">
                QWERTZ (Alemanha) {detectedLayout === 'QWERTZ' ? '★' : ''}
              </option>
            </select>
          </div>

          {/* Export Logs Button with Dropdown */}
          <div ref={exportDropdownRef} className="relative">
            <button
              id="export-logs-btn"
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Exportar logs e diagnósticos gravados"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-medium font-mono transition cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exportar Logs</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-lg shadow-xl border border-slate-700/80 bg-slate-900 py-1 z-50 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    onExportLogs('json');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-200 hover:bg-cyan-500/15 hover:text-cyan-300 flex items-center gap-2 cursor-pointer transition"
                >
                  <FileJson className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-semibold">Exportar JSON</div>
                    <span className="text-[10px] text-slate-400">Histórico completo estruturado</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onExportLogs('csv');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-200 hover:bg-cyan-500/15 hover:text-cyan-300 flex items-center gap-2 cursor-pointer transition border-t border-slate-800/80"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold">Exportar CSV</div>
                    <span className="text-[10px] text-slate-400">Tabela para Excel/Planilhas</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Audio anomaly alert toggle */}
          <button
            id="audio-alert-btn"
            onClick={onToggleSound}
            title={soundEnabled ? 'Alerta Sonoro de Chattering Ativo (clique para silenciar)' : 'Alerta Sonoro Desativado (clique para ativar)'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer active:scale-95 ${
              soundEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Bip Ativo' : 'Bip Mudo'}</span>
          </button>

          {/* Theme toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            title={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            className="p-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer active:scale-95"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Clear history / reset action */}
          <button
            id="clear-history-btn"
            onClick={onClearHistory}
            title="Limpar todos os registros e reiniciar contadores de contato"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition text-xs font-medium cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>

          {/* PWA in-app installation button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
