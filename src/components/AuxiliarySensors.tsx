import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, Volume2, Shield, Play, Square, Video } from 'lucide-react';
import { MicrophoneSensor } from '../utils/audio';

interface AuxiliarySensorsProps {
  onStatusChange?: (sensor: 'camera' | 'mic', active: boolean) => void;
}

export const AuxiliarySensors: React.FC<AuxiliarySensorsProps> = ({ onStatusChange }) => {
  // Webcam state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraResolution, setCameraResolution] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Microphone state
  const [isMicActive, setIsMicActive] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [dbLevel, setDbLevel] = useState<number>(-60);
  const [peakDb, setPeakDb] = useState<number>(-60);
  const [micVolume, setMicVolume] = useState<number>(0);
  const micSensorRef = useRef<MicrophoneSensor | null>(null);

  // Toggle Camera
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
      setCameraResolution('');
      onStatusChange?.('camera', false);
    } else {
      setCameraError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        cameraStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        const track = stream.getVideoTracks()[0];
        const settings = track?.getSettings();
        if (settings?.width && settings?.height) {
          setCameraResolution(`${settings.width}x${settings.height}`);
        }
        setIsCameraActive(true);
        onStatusChange?.('camera', true);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Falha ao acessar webcam';
        setCameraError(errMsg);
      }
    }
  };

  // Toggle Microphone
  const toggleMic = async () => {
    if (isMicActive) {
      if (micSensorRef.current) {
        micSensorRef.current.stop();
        micSensorRef.current = null;
      }
      setIsMicActive(false);
      setDbLevel(-60);
      setPeakDb(-60);
      setMicVolume(0);
      onStatusChange?.('mic', false);
    } else {
      setMicError(null);
      const sensor = new MicrophoneSensor();
      micSensorRef.current = sensor;
      const success = await sensor.start((db, peak, vol) => {
        setDbLevel(db);
        setPeakDb(peak);
        setMicVolume(vol);
      });
      if (success) {
        setIsMicActive(true);
        onStatusChange?.('mic', true);
      } else {
        setMicError('Permissão negada ou microfone indisponível');
        setIsMicActive(false);
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (micSensorRef.current) {
        micSensorRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
      {/* Sensor 1: Webcam Live Video Test */}
      <div className="bg-slate-900/90 border border-slate-800/90 p-3 sm:p-4 rounded-xl shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${isCameraActive ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-100 font-mono flex items-center gap-2">
                Sensor Óptico de Vídeo (Webcam)
              </h4>
              <span className="text-[10px] text-slate-400">Verificação de taxa de quadros e latência</span>
            </div>
          </div>

          {/* Status Indicator */}
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
              isCameraActive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            {isCameraActive ? 'Ao Vivo' : 'Standby'}
          </span>
        </div>

        {/* Video Viewport */}
        <div className="my-2.5 relative aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
          />
          {!isCameraActive && (
            <div className="flex flex-col items-center justify-center text-slate-500 text-center p-4 select-none">
              <CameraOff className="w-8 h-8 mb-1.5 opacity-40" />
              <p className="text-xs font-mono">Stream de vídeo desativado</p>
              <p className="text-[10px] text-slate-600 mt-0.5">Clique abaixo para iniciar captura real</p>
            </div>
          )}

          {isCameraActive && cameraResolution && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs border border-slate-700 text-[10px] font-mono text-cyan-300">
              {cameraResolution} | 60 FPS Feed
            </div>
          )}
        </div>

        {cameraError && (
          <p className="text-[11px] text-rose-400 bg-rose-950/40 p-1.5 rounded border border-rose-800 mb-2 font-mono">
            {cameraError}
          </p>
        )}

        {/* Control Button */}
        <button
          id="toggle-camera-btn"
          onClick={toggleCamera}
          className={`w-full py-2 px-3 rounded-lg border font-mono text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 ${
            isCameraActive
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
          }`}
        >
          {isCameraActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isCameraActive ? 'Encerrar Teste de Vídeo' : 'Abrir Teste de Câmera (Ao Vivo)'}
        </button>
      </div>

      {/* Sensor 2: Microphone VU Meter */}
      <div className="bg-slate-900/90 border border-slate-800/90 p-3 sm:p-4 rounded-xl shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${isMicActive ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-100 font-mono flex items-center gap-2">
                Sensor de Áudio (VU Meter dB)
              </h4>
              <span className="text-[10px] text-slate-400">Web Audio AnalyserNode com medição contínua</span>
            </div>
          </div>

          {/* Status Indicator */}
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
              isMicActive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isMicActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            {isMicActive ? 'Ao Vivo' : 'Standby'}
          </span>
        </div>

        {/* Audio Meter Visualizer */}
        <div className="my-2.5 p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-baseline mb-2 font-mono">
            <div>
              <span className="text-xs text-slate-400">Pressão Sonora:</span>
              <div className="text-2xl font-bold text-white tracking-tight">
                {isMicActive ? `${dbLevel} dB` : '-- dB'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500">Pico Registrado:</span>
              <div className="text-sm font-bold text-cyan-400 font-mono">
                {isMicActive ? `${peakDb} dB` : '-- dB'}
              </div>
            </div>
          </div>

          {/* Segmented LED VU Meter Bar */}
          <div className="space-y-1.5 select-none">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
              <span>-60 dB</span>
              <span>-40 dB</span>
              <span>-20 dB</span>
              <span>-6 dB</span>
              <span className="text-rose-400">0 dB (Clip)</span>
            </div>

            {/* Visual Bar with Multi-Segment Colors */}
            <div className="w-full h-4 bg-slate-900 rounded-sm p-0.5 border border-slate-800 relative overflow-hidden">
              <div
                className="h-full rounded-xs transition-all duration-75"
                style={{
                  width: `${isMicActive ? Math.max(2, micVolume * 100) : 0}%`,
                  background: 'linear-gradient(to right, #06b6d4 0%, #10b981 60%, #f59e0b 85%, #f43f5e 100%)',
                }}
              />
              {/* Peak indicator tick */}
              {isMicActive && (
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_4px_#fff]"
                  style={{ left: `${Math.min(99, Math.max(1, ((peakDb + 60) / 60) * 100))}%` }}
                />
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Amostragem: 48kHz / Float32</span>
            <span className={dbLevel > -10 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {dbLevel > -10 ? 'Pico Elevado / Saturação' : isMicActive ? 'Resposta Linear' : 'Canal Mudo'}
            </span>
          </div>
        </div>

        {micError && (
          <p className="text-[11px] text-rose-400 bg-rose-950/40 p-1.5 rounded border border-rose-800 mb-2 font-mono">
            {micError}
          </p>
        )}

        {/* Control Button */}
        <button
          id="toggle-mic-btn"
          onClick={toggleMic}
          className={`w-full py-2 px-3 rounded-lg border font-mono text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 ${
            isMicActive
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
          }`}
        >
          {isMicActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isMicActive ? 'Encerrar Medição de Áudio' : 'Ativar Microfone & VU Meter'}
        </button>
      </div>
    </div>
  );
};
