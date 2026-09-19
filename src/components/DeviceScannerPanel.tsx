import React, { useState, useEffect, useCallback } from 'react';
import { ConnectedDeviceInfo } from '../types';
import {
  Cpu,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Gamepad2,
  Mic,
  Video,
  Volume2,
  HardDrive,
  CheckCircle,
  Radio,
  Sparkles,
  Usb,
  Calculator,
  ShieldCheck,
} from 'lucide-react';

interface DeviceScannerPanelProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  hasNumpadDetected?: boolean;
}

export const DeviceScannerPanel: React.FC<DeviceScannerPanelProps> = ({
  isExpanded,
  onToggleExpand,
  hasNumpadDetected = false,
}) => {
  const [devices, setDevices] = useState<ConnectedDeviceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [gamepadStatus, setGamepadStatus] = useState<string>('Nenhum controle detectado');
  const [mediaLabelsUnlocked, setMediaLabelsUnlocked] = useState(false);
  const [hasWebHID, setHasWebHID] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'hid' in navigator) {
      setHasWebHID(true);
    }
  }, []);

  const scanDevices = useCallback(async () => {
    setLoading(true);
    const found: ConnectedDeviceInfo[] = [];

    // 1. Media Devices (Webcam, Microphones, Speakers)
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      try {
        const mediaDevs = await navigator.mediaDevices.enumerateDevices();
        let anyLabelFound = false;
        mediaDevs.forEach((dev, index) => {
          let kind: ConnectedDeviceInfo['kind'] = 'audioinput';
          if (dev.kind === 'videoinput') kind = 'videoinput';
          else if (dev.kind === 'audiooutput') kind = 'audiooutput';
          else kind = 'audioinput';

          if (dev.label) {
            anyLabelFound = true;
          }

          found.push({
            id: dev.deviceId || `media-dev-${index}`,
            label: dev.label || `${kind === 'videoinput' ? 'Câmera' : 'Dispositivo de Áudio'} #${index + 1} (Genérico)`,
            kind,
            groupId: dev.groupId,
            connectedAt: Date.now(),
          });
        });
        if (anyLabelFound) {
          setMediaLabelsUnlocked(true);
        }
      } catch {
        // Permission or unsupported
      }
    }

    // 2. WebHID Devices (Keyboards, Mice, Custom Gaming Hardware)
    if (typeof navigator !== 'undefined' && 'hid' in navigator) {
      try {
        const hidList = await (navigator as any).hid.getDevices();
        hidList.forEach((hDev: any, idx: number) => {
          const vId = hDev.vendorId ? `0x${hDev.vendorId.toString(16).padStart(4, '0')}` : undefined;
          const pId = hDev.productId ? `0x${hDev.productId.toString(16).padStart(4, '0')}` : undefined;
          found.push({
            id: `hid-${idx}-${hDev.vendorId}-${hDev.productId}`,
            label: hDev.productName || `Dispositivo USB/HID (${vId || 'Desconhecido'})`,
            kind: 'hid',
            vendorId: vId,
            productId: pId,
            manufacturerName: hDev.manufacturerName,
            connectedAt: Date.now(),
          });
        });
      } catch {
        // WebHID not supported or error
      }
    }

    // 3. Gamepad API
    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      try {
        const gamepads = navigator.getGamepads();
        let connectedGamepadsCount = 0;
        for (let i = 0; i < gamepads.length; i++) {
          const gp = gamepads[i];
          if (gp && gp.connected) {
            connectedGamepadsCount++;
            found.push({
              id: `gamepad-${gp.index}`,
              label: gp.id || `Gamepad #${gp.index}`,
              kind: 'gamepad',
              connectedAt: Date.now(),
            });
          }
        }
        if (connectedGamepadsCount > 0) {
          setGamepadStatus(`${connectedGamepadsCount} controle(s) ativo(s)`);
        } else {
          setGamepadStatus('Aguardando conexão via USB/Bluetooth');
        }
      } catch {
        // Gamepad api error
      }
    }

    // 4. Native Pointer / Keyboard Hardware Capabilities
    if (typeof window !== 'undefined') {
      found.push({
        id: 'primary-pointer',
        label: window.matchMedia('(pointer: fine)').matches
          ? 'Mouse / Ponteiro de Alta Precisão (Fine Sensor)'
          : 'Dispositivo Touch / Coarse',
        kind: 'pointer',
        connectedAt: Date.now(),
      });
      found.push({
        id: 'primary-keyboard',
        label: hasNumpadDetected
          ? 'Teclado Físico Host (100% Full-Size com Numpad)'
          : 'Teclado Físico Host (Captura de Matriz Ativa)',
        kind: 'keyboard',
        connectedAt: Date.now(),
      });
    }

    setDevices(found);
    setLoading(false);
  }, [hasNumpadDetected]);

  // Request Ephemeral Permission to reveal exact Audio/Video hardware brand names
  const handleUnlockMediaNames = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      setLoading(true);
      // Request temporary microphone stream to unlock browser media labels
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately stop all tracks to release hardware
      stream.getTracks().forEach((track) => track.stop());
      setMediaLabelsUnlocked(true);
      await scanDevices();
    } catch {
      // Permission denied or cancelled
    } finally {
      setLoading(false);
    }
  };

  // Request WebHID device pairing to reveal exact Keyboard / Mouse model name
  const handlePairWebHID = async () => {
    if (typeof navigator === 'undefined' || !('hid' in navigator)) return;
    try {
      setLoading(true);
      const chosen = await (navigator as any).hid.requestDevice({ filters: [] });
      if (chosen && chosen.length > 0) {
        await scanDevices();
      }
    } catch {
      // User cancelled dialog
    } finally {
      setLoading(false);
    }
  };

  // Set up dynamic listeners for device plug / unplug
  useEffect(() => {
    scanDevices();

    const handleDeviceChange = () => {
      scanDevices();
    };

    const handleGamepadConnected = () => {
      scanDevices();
    };

    const handleGamepadDisconnected = () => {
      scanDevices();
    };

    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    }
    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    return () => {
      if (navigator.mediaDevices?.removeEventListener) {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      }
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [scanDevices]);

  // Filter devices
  const filteredDevices = devices.filter((d) => {
    if (categoryFilter !== 'all' && d.kind !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return d.label.toLowerCase().includes(q) || d.kind.toLowerCase().includes(q);
    }
    return true;
  });

  const getKindIcon = (kind: ConnectedDeviceInfo['kind']) => {
    switch (kind) {
      case 'videoinput':
        return <Video className="w-3.5 h-3.5 text-cyan-400" />;
      case 'audioinput':
        return <Mic className="w-3.5 h-3.5 text-emerald-400" />;
      case 'audiooutput':
        return <Volume2 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'gamepad':
        return <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'hid':
        return <Usb className="w-3.5 h-3.5 text-purple-400" />;
      case 'keyboard':
        return <Calculator className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <HardDrive className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getKindLabel = (kind: ConnectedDeviceInfo['kind']) => {
    switch (kind) {
      case 'videoinput':
        return 'Câmera';
      case 'audioinput':
        return 'Microfone';
      case 'audiooutput':
        return 'Saída de Áudio';
      case 'gamepad':
        return 'Controle / Gamepad';
      case 'hid':
        return 'Periférico USB/HID';
      case 'pointer':
        return 'Ponteiro / Mouse';
      case 'keyboard':
        return 'Teclado Host';
      default:
        return 'Periférico';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl shadow-xl overflow-hidden transition-all duration-200">
      {/* Collapsible Header Summary Banner */}
      <div
        onClick={onToggleExpand}
        className="px-4 py-3 bg-slate-900 hover:bg-slate-850 cursor-pointer flex items-center justify-between select-none border-b border-slate-800/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-100 font-mono">
                Scanner de Periféricos & Controladores
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {devices.length} identificados
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono hidden sm:inline-flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" /> Plug & Play Dinâmico
              </span>
              {hasNumpadDetected && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono inline-flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" /> Numpad Físico Ativo
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {isExpanded
                ? 'Painel expandido — detecção via WebHID, MediaDevices, Gamepad API e Pointer Capabilities.'
                : 'Clique para expandir o inventário de hardware e controladores de sinal.'}
            </p>
          </div>
        </div>

        {/* Toggle & Rescan */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scanDevices();
            }}
            title="Atualizar lista de periféricos agora"
            className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
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
          {/* Quick Hardware Actions: Unlock Real Names & WebHID Discovery */}
          <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5 mr-auto">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Identificação Avançada de Nomes:
            </span>

            {!mediaLabelsUnlocked && (
              <button
                type="button"
                onClick={handleUnlockMediaNames}
                disabled={loading}
                className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition cursor-pointer flex items-center gap-1.5"
                title="Desbloqueia os nomes de fábrica de microfones, fones e webcams"
              >
                <Mic className="w-3 h-3 text-indigo-400" />
                <span>Identificar Nomes Reais (Áudio/Vídeo)</span>
              </button>
            )}

            {hasWebHID && (
              <button
                type="button"
                onClick={handlePairWebHID}
                disabled={loading}
                className="px-2.5 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 transition cursor-pointer flex items-center gap-1.5"
                title="Conectar via WebHID para obter nome exato de teclados e mouses USB/Bluetooth"
              >
                <Usb className="w-3 h-3 text-purple-400" />
                <span>Identificar Teclado/Mouse via WebHID</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
            <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${
                  categoryFilter === 'all' ? 'bg-indigo-500/25 text-indigo-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos ({devices.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('audioinput')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${
                  categoryFilter === 'audioinput' ? 'bg-emerald-500/25 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Microfones
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('videoinput')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${
                  categoryFilter === 'videoinput' ? 'bg-cyan-500/25 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Câmeras
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('gamepad')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${
                  categoryFilter === 'gamepad' ? 'bg-amber-500/25 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Gamepads
              </button>
              {devices.some((d) => d.kind === 'hid') && (
                <button
                  type="button"
                  onClick={() => setCategoryFilter('hid')}
                  className={`px-2.5 py-1 rounded cursor-pointer transition ${
                    categoryFilter === 'hid' ? 'bg-purple-500/25 text-purple-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  USB/HID
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar dispositivo por nome..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Grid of Devices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {filteredDevices.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-500 font-mono text-xs">
                Nenhum dispositivo encontrado para o filtro especificado.
              </div>
            ) : (
              filteredDevices.map((dev) => (
                <div
                  key={dev.id}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 hover:border-slate-700 transition flex items-start justify-between gap-2 font-mono"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 mt-0.5">
                      {getKindIcon(dev.kind)}
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-slate-200 line-clamp-1" title={dev.label}>
                        {dev.label}
                      </h5>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-400">
                          {getKindLabel(dev.kind)}
                        </span>
                        {dev.vendorId && (
                          <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">
                            VID: {dev.vendorId}
                          </span>
                        )}
                        {dev.productId && (
                          <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">
                            PID: {dev.productId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="shrink-0 flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle className="w-2.5 h-2.5" /> Conectado
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Gamepad API Live Status footer */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              Status de Gamepads: <strong className="text-slate-200">{gamepadStatus}</strong>
            </span>
            <span className="text-slate-500 hidden sm:inline">
              Pressione qualquer botão no controle para autorizar leitura
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

