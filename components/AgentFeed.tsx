
import React, { useEffect, useRef } from 'react';
import { AgentStatus } from '../types';

interface AgentFeedProps {
  logs: AgentStatus[];
  isProcessing: boolean;
}

const AgentFeed: React.FC<AgentFeedProps> = ({ logs, isProcessing }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, isProcessing]);

  const getDeptColor = (dept?: string) => {
    switch(dept) {
      case 'Direction': return 'text-blue-400';
      case 'Advanced': return 'text-indigo-400';
      case 'Texture': return 'text-emerald-400';
      case 'Casting': return 'text-pink-400';
      default: return 'text-zinc-500';
    }
  };

  return (
    <div className="bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col h-full min-h-[400px]">
      {/* Terminal Header */}
      <div className="bg-zinc-900/80 px-4 py-2 border-b border-white/5 flex items-center justify-between sticky top-0 z-20">
         <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
         </div>
         <span className="text-[7px] mono text-zinc-600 font-bold uppercase tracking-widest">LCP_KERNEL_v10.2</span>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-5 space-y-3 mono text-[10px] scroll-smooth custom-scrollbar relative bg-[#020202]"
      >
        {/* Terminal Effects Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

        {logs.length === 0 && !isProcessing ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-900">
            <p className="text-[9px] uppercase tracking-[0.8em] font-black animate-pulse">LCP_STANDBY_</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex items-start gap-3">
                <span className="text-zinc-800 shrink-0 font-bold">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                <div className="flex flex-col gap-1">
                   <span className={`font-black shrink-0 ${getDeptColor(log.department)} uppercase tracking-tighter`}>{log.type.replace(/\s/g, '_')}</span>
                   <p className="text-zinc-400 leading-relaxed break-words border-l border-white/5 pl-3 py-1">
                     {log.message}
                     {i === logs.length - 1 && isProcessing && <span className="inline-block w-2 h-4 bg-indigo-500 ml-1 animate-pulse" />}
                   </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-zinc-900/40 px-5 py-3 border-t border-white/5 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
            <span className="text-[8px] mono text-zinc-600 uppercase font-black tracking-widest">
                {isProcessing ? 'SYNAPSIS_ACTIVE' : 'LCP_CORE_READY'}
            </span>
        </div>
        <div className="flex gap-4">
           <span className="text-[7px] mono text-zinc-700">VRAM: 8.2GB</span>
           <span className="text-[7px] mono text-zinc-700">TENSOR: ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default AgentFeed;
