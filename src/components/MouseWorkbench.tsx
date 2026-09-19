import React, { useRef, useState } from 'react';
import { MouseState } from '../types';
import { Mouse, ArrowUp, ArrowDown, Crosshair, AlertCircle, Compass } from 'lucide-react';

interface MouseWorkbenchProps {
  mouseState: MouseState;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const MouseWorkbench: React.FC<MouseWorkbenchProps> = ({
  mouseState,
  onMouseDown,
  onMouseUp,
  onWheel,
  onMouseMove,
  onContextMenu,
}) => {
  const padRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const { m1, m2, m3, m4, m5, wheel, coords, cps, peakCps } = mouseState;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Top Header of Mouse Workbench */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Mouse className="w-3.5 h-3.5 text-cyan-400" />
            Sensor Óptico & Botões (M1 - M5)
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {isHovered ? (
              <span className="text-emerald-400">Mouse Pad Ativo</span>
            ) : (
              'Passe o cursor sobre o pad'
            )}
          </span>
        </div>

        {/* CPS & Cursor Coordinates Pill */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
            <span className="text-slate-400">CPS:</span>
            <span className={`font-bold ${cps > 6 ? 'text-amber-400' : cps > 0 ? 'text-cyan-300' : 'text-slate-300'}`}>
              {cps}
            </span>
            <span className="text-slate-500 text-[10px]">(Pico: {peakCps})</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
            <Crosshair className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">X:</span>
            <span className="text-slate-200 w-8">{coords.padX}</span>
            <span className="text-slate-400">Y:</span>
            <span className="text-slate-200 w-8">{coords.padY}</span>
          </div>
        </div>
      </div>

      {/* Mouse Workbench Body Grid: Ergonomic Mouse Graphic + Interactive Mouse Testing Pad */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/90 border border-slate-800/90 p-3 sm:p-4 rounded-xl shadow-xl select-none">
        
        {/* Left column: Ergonomic Vector Mouse Representation (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg relative overflow-hidden">
          <span className="absolute top-2 left-2.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Esquema Físico
          </span>

          {/* Ergonomic SVG Mouse Blueprint */}
          <div className="relative w-48 h-64 my-1 flex items-center justify-center">
            
            {/* SVG Mouse Shell */}
            <svg viewBox="0 0 200 280" className="w-full h-full drop-shadow-md">
              {/* Outer Mouse Contour Chassis */}
              <path
                d="M 60 20 
                   C 35 35, 20 80, 20 140 
                   C 20 200, 35 260, 100 260 
                   C 165 260, 180 200, 180 140 
                   C 180 80, 165 35, 140 20 
                   C 115 10, 85 10, 60 20 Z"
                className="fill-slate-900 stroke-slate-700"
                strokeWidth="3"
              />

              {/* Palm Rest / Lower Body Glow */}
              <path
                d="M 28 150 
                   C 28 210, 45 250, 100 250 
                   C 155 250, 172 210, 172 150 
                   C 140 165, 60 165, 28 150 Z"
                className="fill-slate-800/80 stroke-slate-700/60"
                strokeWidth="1.5"
              />

              {/* Left Click (M1) */}
              <path
                id="mouse-m1-btn"
                d="M 60 22 
                   C 40 35, 28 75, 28 135 
                   L 93 142 
                   L 93 72 
                   L 78 72 
                   L 78 20 
                   Z"
                className={`transition-colors duration-75 cursor-pointer ${
                  m1.isPressed
                    ? 'fill-cyan-500 stroke-cyan-300'
                    : m1.hasAnomaly
                    ? 'fill-rose-900/80 stroke-rose-500'
                    : m1.pressCount > 0
                    ? 'fill-slate-800 stroke-slate-600'
                    : 'fill-slate-850 stroke-slate-700'
                }`}
                strokeWidth="2"
              />

              {/* Right Click (M2) */}
              <path
                id="mouse-m2-btn"
                d="M 140 22 
                   C 160 35, 172 75, 172 135 
                   L 107 142 
                   L 107 72 
                   L 122 72 
                   L 122 20 
                   Z"
                className={`transition-colors duration-75 cursor-pointer ${
                  m2.isPressed
                    ? 'fill-cyan-500 stroke-cyan-300'
                    : m2.hasAnomaly
                    ? 'fill-rose-900/80 stroke-rose-500'
                    : m2.pressCount > 0
                    ? 'fill-slate-800 stroke-slate-600'
                    : 'fill-slate-850 stroke-slate-700'
                }`}
                strokeWidth="2"
              />

              {/* Middle Wheel Slot */}
              <rect x="80" y="24" width="40" height="70" rx="6" className="fill-slate-950 stroke-slate-700" strokeWidth="1.5" />

              {/* Scroll Wheel / M3 Click */}
              <rect
                id="mouse-m3-btn"
                x="88"
                y="32"
                width="24"
                height="52"
                rx="12"
                className={`transition-all duration-75 cursor-pointer ${
                  m3.isPressed
                    ? 'fill-emerald-500 stroke-emerald-300'
                    : wheel.active
                    ? 'fill-cyan-600 stroke-cyan-400'
                    : m3.hasAnomaly
                    ? 'fill-rose-800 stroke-rose-500'
                    : 'fill-slate-700 stroke-slate-500'
                }`}
                strokeWidth="2"
              />

              {/* Wheel notches & directional motion */}
              <line x1="94" y1="46" x2="106" y2="46" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              <line x1="94" y1="58" x2="106" y2="58" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              <line x1="94" y1="70" x2="106" y2="70" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

              {/* M4 Button (Side Thumb Back) */}
              <path
                id="mouse-m4-btn"
                d="M 17 115 
                   C 12 120, 10 135, 12 145 
                   L 22 142 
                   L 22 118 
                   Z"
                className={`transition-colors duration-75 ${
                  m4.isPressed ? 'fill-cyan-400 stroke-cyan-200' : 'fill-slate-700 stroke-slate-600'
                }`}
                strokeWidth="1.5"
              />

              {/* M5 Button (Side Thumb Forward) */}
              <path
                id="mouse-m5-btn"
                d="M 21 82 
                   C 16 90, 14 100, 17 110 
                   L 23 112 
                   L 23 85 
                   Z"
                className={`transition-colors duration-75 ${
                  m5.isPressed ? 'fill-cyan-400 stroke-cyan-200' : 'fill-slate-700 stroke-slate-600'
                }`}
                strokeWidth="1.5"
              />
            </svg>

            {/* Tactical Overlays */}
            <div className="absolute top-8 left-8 text-[11px] font-mono font-bold text-cyan-400 pointer-events-none">
              M1 {m1.pressCount > 0 ? `(${m1.pressCount})` : ''}
            </div>
            <div className="absolute top-8 right-8 text-[11px] font-mono font-bold text-cyan-400 pointer-events-none">
              M2 {m2.pressCount > 0 ? `(${m2.pressCount})` : ''}
            </div>
            <div className="absolute top-24 text-[10px] font-mono font-bold text-emerald-400 pointer-events-none">
              M3
            </div>
            <div className="absolute top-20 left-0 text-[10px] font-mono font-bold text-slate-300 pointer-events-none">
              M5
            </div>
            <div className="absolute top-28 left-0 text-[10px] font-mono font-bold text-slate-300 pointer-events-none">
              M4
            </div>

            {/* Wheel Direction Flash */}
            {wheel.active && (
              <div
                className={`absolute top-4 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 shadow-lg ${
                  wheel.direction === 'up'
                    ? 'bg-cyan-500 text-slate-950 animate-bounce'
                    : 'bg-emerald-500 text-slate-950 animate-bounce'
                }`}
              >
                {wheel.direction === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span>Scroll {wheel.direction === 'up' ? '▲ Cima' : '▼ Baixo'}</span>
              </div>
            )}
          </div>

          {/* Mini button breakdown */}
          <div className="grid grid-cols-5 gap-1.5 w-full mt-2 text-[10px] font-mono text-center">
            <div className={`p-1 rounded border ${m1.isPressed ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
              <div className="font-bold">M1</div>
              <div>{m1.pressCount}x</div>
            </div>
            <div className={`p-1 rounded border ${m2.isPressed ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
              <div className="font-bold">M2</div>
              <div>{m2.pressCount}x</div>
            </div>
            <div className={`p-1 rounded border ${m3.isPressed ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
              <div className="font-bold">M3</div>
              <div>{m3.pressCount}x</div>
            </div>
            <div className={`p-1 rounded border ${m4.isPressed ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
              <div className="font-bold">M4</div>
              <div>{m4.pressCount}x</div>
            </div>
            <div className={`p-1 rounded border ${m5.isPressed ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
              <div className="font-bold">M5</div>
              <div>{m5.pressCount}x</div>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Mouse Testing Surface & Chattering Watchpad (7 cols) */}
        <div
          ref={padRef}
          id="mouse-pad-surface"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          onWheel={onWheel}
          onContextMenu={onContextMenu}
          className="md:col-span-7 relative min-h-[220px] rounded-lg border-2 border-dashed border-slate-700/80 bg-slate-950/90 hover:border-cyan-500/60 p-4 flex flex-col justify-between cursor-crosshair transition-colors"
        >
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40 rounded-lg" />

          {/* Header indicator */}
          <div className="flex items-center justify-between z-10 pointer-events-none">
            <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              Área de Teste de Clique & Rolagem
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              Botão Direito Livre (Sem Menu)
            </span>
          </div>

          {/* Central Callout & Status */}
          <div className="flex flex-col items-center justify-center my-auto py-4 z-10 pointer-events-none text-center">
            <p className="text-xs text-slate-300 font-medium">
              Clique com <strong className="text-cyan-400">M1</strong>, <strong className="text-cyan-400">M2</strong>, <strong className="text-emerald-400">M3 (Scroll)</strong> ou <strong className="text-cyan-400">M4/M5</strong> aqui
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
              Role a roda para cima/baixo para calibrar o encoder óptico. Cliques rápidos analisam double-click involuntário e repique de contato.
            </p>

            {/* Realtime Click feedback badge */}
            <div className="flex items-center gap-2 mt-3">
              <div className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
                Rolagens: <span className="text-cyan-400 font-bold">{wheel.totalScrolls}</span>
              </div>
              <div className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
                Latência de Retorno: <span className="text-emerald-400 font-bold">&lt; 1ms</span>
              </div>
            </div>
          </div>

          {/* Bottom cursor trail coordinates */}
          <div className="flex justify-between items-center z-10 text-[10px] font-mono text-slate-400 pointer-events-none pt-2 border-t border-slate-800/80">
            <span>Pad Rel: ({coords.padX}px, {coords.padY}px)</span>
            <span>Viewport: ({coords.x}px, {coords.y}px)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
